const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = async function (req, res, next){
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(" ")[1];
        if(!accessToken){
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateToken(accessToken, 'access');
        if(!userData){
            return next(ApiError.UnauthorizedError());
        }

        // Проверяем, что у пользователя есть активная сессия (refresh token в БД)
        // Если пользователь вышел на другой вкладке, refresh token удален
        const hasActiveSession = await tokenService.hasUserTokens(userData.id, 'refresh');
        if(!hasActiveSession){
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;
        next();
    } catch(e){
        return next(ApiError.UnauthorizedError());
    }
}