const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

/**
 * Middleware для проверки прав администратора
 * Требует предварительной аутентификации (использовать после auth-middleware)
 * 
 * Использование в роутах:
 * router.get('/admin/endpoint', authMiddleware, adminMiddleware, controller.method);
 */
module.exports = async function (req, res, next) {
    try {
        // Проверяем, что пользователь уже авторизован
        if (!req.user) {
            return next(ApiError.UnauthorizedError());
        }

        // Проверяем роль пользователя
        if (req.user.role !== 'admin') {
            return next(ApiError.Forbidden('Доступ запрещен. Требуются права администратора.'));
        }

        // Пользователь является администратором, продолжаем
        next();
    } catch (e) {
        return next(ApiError.Forbidden('Ошибка проверки прав доступа'));
    }
}

