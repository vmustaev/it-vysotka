const Router = require('express').Router;
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');

/**
 * ПРИМЕР использования admin-middleware
 * 
 * Все роуты защищены двумя middleware:
 * 1. authMiddleware - проверяет авторизацию
 * 2. adminMiddleware - проверяет роль admin
 * 
 * Порядок важен! Сначала auth, потом admin.
 */

// Пример: получить всех участников (будущий функционал)
// router.get('/participants', authMiddleware, adminMiddleware, participantsController.getAll);

// Пример: экспорт участников в Excel
// router.get('/participants/export', authMiddleware, adminMiddleware, participantsController.exportToExcel);

// Пример: управление аудиториями
// router.get('/rooms', authMiddleware, adminMiddleware, roomsController.getAll);
// router.post('/rooms', authMiddleware, adminMiddleware, roomsController.create);
// router.put('/rooms/:id', authMiddleware, adminMiddleware, roomsController.update);
// router.delete('/rooms/:id', authMiddleware, adminMiddleware, roomsController.delete);

// Пример: рассадка
// router.get('/seating', authMiddleware, adminMiddleware, seatingController.getCurrent);
// router.post('/seating/auto', authMiddleware, adminMiddleware, seatingController.autoAssign);
// router.post('/seating/manual', authMiddleware, adminMiddleware, seatingController.manualAssign);

// Пример: настройки
// router.get('/settings', authMiddleware, adminMiddleware, settingsController.getAll);
// router.put('/settings/registration', authMiddleware, adminMiddleware, settingsController.toggleRegistration);

// Пример: CMS
// router.post('/cms/upload', authMiddleware, adminMiddleware, cmsController.uploadFile);
// router.delete('/cms/file/:id', authMiddleware, adminMiddleware, cmsController.deleteFile);

// Пример: логи
// router.get('/logs', authMiddleware, adminMiddleware, logsController.getAll);

module.exports = router;

