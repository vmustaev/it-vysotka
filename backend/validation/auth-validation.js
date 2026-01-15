const { body } = require('express-validator');
const errorMessages = require('./error-messages');

const validateCyrillic = (value) => {
    if (!value) return true;
    if (!/^[а-яА-ЯёЁ\s\-]+$/.test(value)) {
        throw new Error(errorMessages.LAST_NAME_CYRILLIC);
    }
    return true;
};

const validatePhone = (value) => {
    if (!value) return false;
    const cleanedPhone = value.replace(/\D/g, '');
    return /^(\+7|7|8)\d{10}$/.test(cleanedPhone);
};

const validateDate = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
};

const validateAge = (value) => {
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 6 && age - 1 <= 100;
    }
    return age >= 6 && age <= 100;
};

const registrationValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.EMAIL_REQUIRED)
        .isEmail().withMessage(errorMessages.EMAIL_INVALID)
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage(errorMessages.PASSWORD_REQUIRED)
        .isLength({ min: 8, max: 32 }).withMessage(errorMessages.PASSWORD_LENGTH)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(errorMessages.PASSWORD_COMPLEXITY),
    
    body('password_confirmation')
        .notEmpty().withMessage('Подтверждение пароля обязательно')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(errorMessages.PASSWORD_MISMATCH);
            }
            return true;
        }),
    
    body('last_name')
        .notEmpty().withMessage(errorMessages.LAST_NAME_REQUIRED)
        .custom(validateCyrillic),
    
    body('first_name')
        .notEmpty().withMessage(errorMessages.FIRST_NAME_REQUIRED)
        .custom(validateCyrillic),
    
    body('second_name')
        .optional({ checkFalsy: true })
        .custom(validateCyrillic),
    
    body('birthday')
        .notEmpty().withMessage(errorMessages.BIRTHDAY_REQUIRED)
        .custom(validateDate).withMessage(errorMessages.BIRTHDAY_INVALID)
        .custom(validateAge).withMessage(errorMessages.BIRTHDAY_AGE),
    
    body('region')
        .notEmpty().withMessage('Регион обязателен'),
    
    body('city')
        .notEmpty().withMessage('Город обязателен'),
    
    body('school')
        .notEmpty().withMessage('Школа обязательна'),
    
    body('programming_language')
        .notEmpty().withMessage('Язык программирования обязателен')
        .isIn(['C++', 'Python', 'Java']).withMessage('Неверный формат. Допустимо: C++ или Python или Java'),
    
    body('phone')
        .notEmpty().withMessage(errorMessages.PHONE_REQUIRED)
        .custom(validatePhone).withMessage(errorMessages.PHONE_INVALID),
    
    body('grade')
        .notEmpty().withMessage('Класс обязателен')
        .isInt({ min: 1, max: 11 }).withMessage(errorMessages.GRADE_INVALID),
    
    body('parentConsent')
        .custom((value) => {
            if (value !== true) {
                throw new Error('Необходимо дать согласие на обработку персональных данных');
            }
            return true;
        })
];

const loginValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.EMAIL_REQUIRED)
        .isEmail().withMessage(errorMessages.EMAIL_INVALID)
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage(errorMessages.PASSWORD_REQUIRED)
];

module.exports = {
    registrationValidation,
    loginValidation
};