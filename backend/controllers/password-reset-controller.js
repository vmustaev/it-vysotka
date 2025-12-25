const userService = require('../service/user-service');
const ApiError = require('../exceptions/api-error');

class PasswordResetController {
    async requestReset(req, res, next) {
        try {
            const { email } = req.body;
            
            if (!email) {
                throw ApiError.BadRequest(
                    'Email обязателен',
                    ['Email обязателен'],
                    { email: ['Email обязателен'] }
                );
            }

            await userService.requestPasswordReset(email);
            
            return res.json({
                success: true,
                message: 'Ссылка для сброса пароля отправлена на указанный email. Проверьте почту.'
            });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword, confirmPassword } = req.body;
            
            if (!token || !newPassword || !confirmPassword) {
                throw ApiError.BadRequest(
                    'Все поля обязательны',
                    ['Все поля обязательны']
                );
            }

            if (newPassword !== confirmPassword) {
                throw ApiError.BadRequest(
                    'Пароли не совпадают',
                    ['Пароли не совпадают'],
                    { confirmPassword: ['Пароли не совпадают'] }
                );
            }

            await userService.resetPassword(token, newPassword);
            
            return res.json({
                success: true,
                message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new PasswordResetController();