const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const passwordResetController = require('../controllers/password-reset-controller');
const schoolController = require('../controllers/school-controller');
const teamController = require('../controllers/team-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');
const validationMiddleware = require('../middlewares/validation-middleware');
const { registrationValidation, loginValidation } = require('../validation/auth-validation');
const { passwordResetRequestValidation, passwordResetValidation } = require('../validation/password-reset-validation');
const { createTeamValidation } = require('../validation/team-validation');

router.post('/registration', registrationValidation, validationMiddleware, userController.registration);
router.post('/login', loginValidation, validationMiddleware, userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.post('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

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

module.exports = router;