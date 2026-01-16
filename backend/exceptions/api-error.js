module.exports = class ApiError extends Error{
    status;
    errors;
    fieldErrors;

    constructor(status, message, errors = [], fieldErrors = {}){
        super(message);
        this.status = status;
        this.errors = errors;
        this.fieldErrors = fieldErrors;
    }

    static UnauthorizedError(){
        return new ApiError(401, "Пользователь не авторизован");
    }

    static BadRequest(message, errors=[], fieldErrors={}){
        return new ApiError(400, message, errors, fieldErrors);
    }

    static Forbidden(message = "Недостаточно прав для выполнения действия"){
        return new ApiError(403, message);
    }
}