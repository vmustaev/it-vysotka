const { body } = require('express-validator');
const errorMessages = require('./error-messages');

const passwordResetRequestValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.EMAIL_REQUIRED)
        .isEmail().withMessage(errorMessages.EMAIL_INVALID)
        .normalizeEmail()
];

const passwordResetValidation = [
    body('token')
        .notEmpty().withMessage('Токен обязателен'),
    
    body('newPassword')
        .notEmpty().withMessage(errorMessages.PASSWORD_REQUIRED)
        .isLength({ min: 8, max: 32 }).withMessage(errorMessages.PASSWORD_LENGTH)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(errorMessages.PASSWORD_COMPLEXITY),
    
    body('confirmPassword')
        .notEmpty().withMessage('Подтверждение пароля обязательно')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error(errorMessages.PASSWORD_MISMATCH);
            }
            return true;
        })
];

module.exports = {
    passwordResetRequestValidation,
    passwordResetValidation
};