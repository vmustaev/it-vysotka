const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const passwordResetController = require('../controllers/password-reset-controller');
const schoolController = require('../controllers/school-controller');
const teamController = require('../controllers/team-controller');
const participantsController = require('../controllers/participants-controller');
const roomController = require('../controllers/room-controller');
const seatingController = require('../controllers/seating-controller');
const settingsController = require('../controllers/settings-controller');
const certificateController = require('../controllers/certificate-controller');
const fileController = require('../controllers/file-controller');
const backupController = require('../controllers/backup-controller');
const resultsController = require('../controllers/results-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');
const validationMiddleware = require('../middlewares/validation-middleware');
const { registrationValidation, loginValidation } = require('../validation/auth-validation');
const { passwordResetRequestValidation, passwordResetValidation } = require('../validation/password-reset-validation');
const { createTeamValidation } = require('../validation/team-validation');
const { createRoomValidation, updateRoomValidation } = require('../validation/room-validation');
const multer = require('multer');
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Исправляем кодировку имени файла
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
    }
});

router.post('/registration', registrationValidation, validationMiddleware, userController.registration);
router.post('/login', loginValidation, validationMiddleware, userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.post('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/user/profile', authMiddleware, userController.getProfile);
router.put('/user/participation-format', authMiddleware, userController.updateParticipationFormat);
router.put('/user/essay-url', authMiddleware, userController.updateEssayUrl);

router.post('/password/reset/request', passwordResetRequestValidation, validationMiddleware, passwordResetController.requestReset);
router.post('/password/reset', passwordResetValidation, validationMiddleware, passwordResetController.resetPassword);

// School routes
router.get('/schools/regions', schoolController.getRegions);
router.get('/schools/cities', schoolController.getCities);
router.get('/schools', schoolController.getSchools);

// Team routes
router.post('/team/create', authMiddleware, createTeamValidation, validationMiddleware, teamController.create);
router.get('/team/join/:inviteToken', teamController.joinByLink); // GET для присоединения по ссылке (как активация)
router.post('/team/join/:inviteToken', authMiddleware, teamController.join); // POST для API запросов
router.get('/team/my', authMiddleware, teamController.getMyTeam);
router.post('/team/leave', authMiddleware, teamController.leave);
router.delete('/team/kick/:userId', authMiddleware, teamController.kickMember);
router.delete('/team/delete', authMiddleware, teamController.delete);

// Admin routes - Participants
router.get('/admin/participants', authMiddleware, adminMiddleware, participantsController.getAll);
router.get('/admin/participants/stats', authMiddleware, adminMiddleware, participantsController.getStats);
router.get('/admin/participants/export', authMiddleware, adminMiddleware, participantsController.exportToExcel);
router.get('/admin/participants/:id', authMiddleware, adminMiddleware, participantsController.getById);
router.put('/admin/participants/:id/place', authMiddleware, adminMiddleware, participantsController.updatePlace);
router.delete('/admin/participants/:id', authMiddleware, adminMiddleware, participantsController.deleteParticipant);
router.post('/admin/participants/send-essay-reminders', authMiddleware, adminMiddleware, participantsController.sendEssayReminders);
router.post('/admin/participants/send-team-format-without-team-reminders', authMiddleware, adminMiddleware, participantsController.sendTeamFormatWithoutTeamReminders);

// Admin routes - Teams
router.get('/admin/teams', authMiddleware, adminMiddleware, teamController.getAllTeams);

// Admin routes - Rooms
router.post('/admin/rooms', authMiddleware, adminMiddleware, createRoomValidation, validationMiddleware, roomController.create);
router.get('/admin/rooms', authMiddleware, adminMiddleware, roomController.getAll);
router.get('/admin/rooms/:id', authMiddleware, adminMiddleware, roomController.getById);
router.put('/admin/rooms/:id', authMiddleware, adminMiddleware, updateRoomValidation, validationMiddleware, roomController.update);
router.delete('/admin/rooms/:id', authMiddleware, adminMiddleware, roomController.delete);

// Admin routes - Seating
router.post('/admin/seating/auto-assign', authMiddleware, adminMiddleware, seatingController.autoAssign);
router.get('/admin/seating', authMiddleware, adminMiddleware, seatingController.getSeating);
router.get('/admin/seating/export', authMiddleware, adminMiddleware, seatingController.exportToExcel);
router.get('/admin/seating/unassigned', authMiddleware, adminMiddleware, seatingController.getUnassigned);
router.post('/admin/seating/add-unassigned', authMiddleware, adminMiddleware, seatingController.addUnassigned);
router.delete('/admin/seating/clear', authMiddleware, adminMiddleware, seatingController.clearSeating);
router.post('/admin/seating/assign', authMiddleware, adminMiddleware, seatingController.assignItem);
router.post('/admin/seating/remove', authMiddleware, adminMiddleware, seatingController.removeAssignment);

// Admin routes - Settings
router.get('/admin/settings', authMiddleware, adminMiddleware, settingsController.getSettings);
router.put('/admin/settings', authMiddleware, adminMiddleware, settingsController.updateSettings);
router.post('/admin/settings/clear-data', authMiddleware, adminMiddleware, settingsController.clearDataForNewYear);

// Admin routes - User results
router.put('/admin/users/:userId/result', authMiddleware, adminMiddleware, userController.setUserResult);

// Admin routes - Certificates
router.post('/admin/certificates/upload-template', authMiddleware, adminMiddleware, upload.single('template'), certificateController.uploadTemplate);
router.post('/admin/certificates/upload-font', authMiddleware, adminMiddleware, upload.single('font'), certificateController.uploadFont);
router.get('/admin/certificates/settings', authMiddleware, adminMiddleware, certificateController.getSettings);
router.put('/admin/certificates/settings', authMiddleware, adminMiddleware, certificateController.updateSettings);
router.get('/admin/certificates/template', authMiddleware, adminMiddleware, certificateController.getTemplate);
router.get('/admin/certificates/preview', authMiddleware, adminMiddleware, certificateController.preview);
router.get('/admin/certificates/preview/:participantId', authMiddleware, adminMiddleware, certificateController.preview);
router.get('/admin/certificates/generate/:participantId', authMiddleware, adminMiddleware, certificateController.generateOne);
router.post('/admin/certificates/generate-all', authMiddleware, adminMiddleware, certificateController.generateAll);
router.post('/admin/certificates/issue', authMiddleware, adminMiddleware, certificateController.issueCertificates);
router.post('/admin/certificates/send-notifications', authMiddleware, adminMiddleware, certificateController.sendCertificateNotifications);

// Participant routes - Certificates
router.get('/certificates/download/:participantId', authMiddleware, certificateController.downloadCertificate);

// Public routes - Settings
router.get('/settings/registration-status', settingsController.getRegistrationStatus);

// Admin routes - Files
router.post('/admin/files/upload', authMiddleware, adminMiddleware, upload.single('file'), fileController.upload);
router.get('/admin/files', authMiddleware, adminMiddleware, fileController.getAll);
router.get('/admin/files/stats', authMiddleware, adminMiddleware, fileController.getStats);
router.get('/admin/files/:id', authMiddleware, adminMiddleware, fileController.getById);
router.put('/admin/files/:id', authMiddleware, adminMiddleware, fileController.update);
router.delete('/admin/files/:id', authMiddleware, adminMiddleware, fileController.delete);

// Admin routes - Backups
router.post('/admin/backups', authMiddleware, adminMiddleware, backupController.create);
router.get('/admin/backups', authMiddleware, adminMiddleware, backupController.list);
router.get('/admin/backups/download/:filename', authMiddleware, adminMiddleware, backupController.download);
router.delete('/admin/backups/:filename', authMiddleware, adminMiddleware, backupController.delete);

// Public routes - Files (получение файлов по типу)
router.get('/files/type/:type', fileController.getByType);

// Public routes - Results
router.get('/results/years', resultsController.getYears);
router.get('/results/year/:year', resultsController.getResultsByYear);

// Admin routes - Results
router.get('/admin/results', authMiddleware, adminMiddleware, resultsController.getAllResults);
router.post('/admin/results', authMiddleware, adminMiddleware, resultsController.createResult);
router.post('/admin/results/from-participants', authMiddleware, adminMiddleware, resultsController.createResultsFromParticipants);
router.post('/admin/results/send-winner-notifications', authMiddleware, adminMiddleware, resultsController.sendWinnerNotifications);
router.put('/admin/results/:id', authMiddleware, adminMiddleware, resultsController.updateResult);
router.delete('/admin/results/:id', authMiddleware, adminMiddleware, resultsController.deleteResult);

module.exports = router;