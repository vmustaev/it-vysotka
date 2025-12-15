const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        const errorMessages = [];
        
        errors.array().forEach(error => {
            if (!formattedErrors[error.path]) {
                formattedErrors[error.path] = [];
            }
            formattedErrors[error.path].push(error.msg);
            errorMessages.push(error.msg);
        });
        
        return next(ApiError.BadRequest(
            "Ошибка валидации данных",
            errorMessages,
            formattedErrors
        ));
    }
    
    next();
};

module.exports = validationMiddleware;