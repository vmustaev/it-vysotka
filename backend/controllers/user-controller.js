const userService = require('../service/user-service');
const settingsService = require('../service/settings-service');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next) {
        try {
            // Проверяем, открыта ли регистрация
            const isRegistrationOpen = await settingsService.isRegistrationOpen();
            if (!isRegistrationOpen) {
                throw ApiError.BadRequest('Регистрация закрыта');
            }

            const {
                email, password, password_confirmation,
                last_name, first_name, second_name, birthday,
                region, city, school, programming_language,
                phone, grade
            } = req.body;
            
            const additionalData = {
                last_name,
                first_name,
                second_name: second_name || null,
                birthday,
                region,
                city,
                school,
                programming_language,
                phone,
                grade: parseInt(grade)
            };
            
            await userService.registration(email, password, additionalData);
            return res.json({
                success: true,
                message: 'Регистрация успешна! Пожалуйста, проверьте вашу почту для активации аккаунта.'
            });
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json({
                success: true,
                message: 'Вход выполнен успешно',
                data: userData
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            await userService.logout(refreshToken || null);
            res.clearCookie("refreshToken");
            return res.json({
                success: true,
                message: 'Выход выполнен успешно'
            });

        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationToken = req.params.link;
            await userService.activate(activationToken);
            // Редирект на фронтенд с успешным сообщением
            return res.redirect(`${process.env.URL}/login?activated=true`);
        } catch (e) {
            // Редирект на фронтенд с ошибкой
            return res.redirect(`${process.env.URL}/login?activation_error=true`);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            
            if (!refreshToken) {
                return next(ApiError.UnauthorizedError());
            }
            
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json({
                success: true,
                data: userData
            });

        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json({
                success: true,
                data: users
            });
        } catch (e) {
            next(e);
        }
    }

    async getProfile(req, res, next) {
        try {
            const userId = req.user.id; // Из authMiddleware
            const profile = await userService.getProfile(userId);
            return res.json({
                success: true,
                data: profile
            });
        } catch (e) {
            next(e);
        }
    }

    async updateParticipationFormat(req, res, next) {
        try {
            const userId = req.user.id; // Из authMiddleware
            const { participation_format } = req.body;
            
            if (!participation_format) {
                return next(ApiError.BadRequest('Формат участия не указан'));
            }
            
            const result = await userService.updateParticipationFormat(userId, participation_format);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async updateEssayUrl(req, res, next) {
        try {
            const userId = req.user.id; // Из authMiddleware
            const { essayUrl } = req.body;
            
            if (essayUrl === undefined || essayUrl === null) {
                return next(ApiError.BadRequest('Ссылка на эссе не указана'));
            }
            
            const result = await userService.updateEssayUrl(userId, essayUrl);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async setUserResult(req, res, next) {
        try {
            const { userId } = req.params;
            const { place, certificateUrl } = req.body;
            
            if (!userId) {
                return next(ApiError.BadRequest('ID пользователя не указан'));
            }
            
            const result = await userService.setUserResult(parseInt(userId), place, certificateUrl);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();