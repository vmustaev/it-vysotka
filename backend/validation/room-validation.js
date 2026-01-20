const { body } = require('express-validator');

const createRoomValidation = [
    body('number')
        .trim()
        .notEmpty()
        .withMessage('Номер аудитории обязателен')
        .isLength({ min: 1, max: 50 })
        .withMessage('Номер аудитории должен быть от 1 до 50 символов'),
    body('capacity')
        .isInt({ min: 1 })
        .withMessage('Количество мест должно быть целым числом не менее 1')
        .toInt()
];

const updateRoomValidation = [
    body('number')
        .trim()
        .notEmpty()
        .withMessage('Номер аудитории обязателен')
        .isLength({ min: 1, max: 50 })
        .withMessage('Номер аудитории должен быть от 1 до 50 символов'),
    body('capacity')
        .isInt({ min: 1 })
        .withMessage('Количество мест должно быть целым числом не менее 1')
        .toInt()
];

module.exports = {
    createRoomValidation,
    updateRoomValidation
};
