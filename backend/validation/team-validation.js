const { body } = require('express-validator');

const createTeamValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Название команды обязательно')
        .isLength({ min: 3, max: 50 })
        .withMessage('Название команды должно быть от 3 до 50 символов')
        .matches(/^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/)
        .withMessage('Название команды может содержать только буквы (русские/английские) и цифры')
];

module.exports = {
    createTeamValidation
};
