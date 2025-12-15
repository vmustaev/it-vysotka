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
            
            const userData = await userService.registration(email, password, additionalData);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json({
                success: true,
                data: userData
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
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next)
    {
        try{
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken");
            return res.json(token);

        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next)
    {
        try{
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.URL);

        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next)
    {
        try{
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json(userData);

        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next)
    {
        try{
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();