const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next)
    {
        try{
            const {
                email, password, password_confirmation,
                last_name, first_name, second_name, birthday,
                region, city, school, programming_language,
                phone, format, grade
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
                format,
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

    async login(req, res, next)
    {
        try{
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

    async logout(req, res, next)
    {
        try{
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

    async activate(req, res, next)
    {
        try{
            const activationToken = req.params.link;
            await userService.activate(activationToken);
            // Редирект на фронтенд с успешным сообщением
            return res.redirect(`${process.env.URL}/login?activated=true`);
        } catch (e) {
            // Редирект на фронтенд с ошибкой
            return res.redirect(`${process.env.URL}/login?activation_error=true`);
        }
    }

    async refresh(req, res, next)
    {
        try{
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

    async getUsers(req, res, next)
    {
        try{
            const users = await userService.getAllUsers();
            return res.json({
                success: true,
                data: users
            });
        } catch (e) {
            next(e);
        }
    }

    async getProfile(req, res, next)
    {
        try{
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
}

module.exports = new UserController();