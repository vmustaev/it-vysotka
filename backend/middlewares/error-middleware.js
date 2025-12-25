const ApiError = require("../exceptions/api-error")

module.exports = function (err, req, res, next) {
    console.log(err);

    if (err instanceof ApiError){
        return res.status(err.status).json({
            success: false,
            message: err.message,
            errors: err.errors,
            fieldErrors: err.fieldErrors || {}
        })
    }

    return res.status(500).json({
        success: false,
        message: "Непредвиденная ошибка сервера",
        errors: process.env.NODE_ENV === 'development' ? [err.message] : ['Произошла внутренняя ошибка сервера'],
        fieldErrors: {}
    })
}