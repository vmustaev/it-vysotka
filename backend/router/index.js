const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');
const validationMiddleware = require('../middlewares/validation-middleware');
const { registrationValidation, loginValidation } = require('../validation/auth-validation');

router.post('/registration', registrationValidation, validationMiddleware, userController.registration);
router.post('/login', loginValidation, validationMiddleware, userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.post('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

module.exports = router;