const ApiError = require('../exceptions/api-error');

/**
 * Middleware для проверки прав волонтера
 * Требует предварительной аутентификации (использовать после auth-middleware)
 * 
 * Использование в роутах:
 * router.get('/volunteer/endpoint', authMiddleware, volunteerMiddleware, controller.method);
 */
module.exports = async function (req, res, next) {
    try {
        // Проверяем, что пользователь уже авторизован
        if (!req.user) {
            return next(ApiError.UnauthorizedError());
        }

        // Проверяем роль пользователя (волонтер или админ)
        if (req.user.role !== 'volunteer' && req.user.role !== 'admin') {
            return next(ApiError.Forbidden('Доступ запрещен. Требуются права волонтера.'));
        }

        // Пользователь является волонтером или админом, продолжаем
        next();
    } catch (e) {
        return next(ApiError.Forbidden('Ошибка проверки прав доступа'));
    }
}

