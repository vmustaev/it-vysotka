const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt'); 
const uuid = require('uuid');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const mailService = require('./mail-service');
const ApiError = require('../exceptions/api-error');
const errorMessages = require('../validation/error-messages');

class UserService {
    async registration(email, password, additionalData) {
        const candidate = await UserModel.findOne({ where: { email } });
        if (candidate) {
            throw ApiError.BadRequest(
                errorMessages.EMAIL_EXISTS,
                [errorMessages.EMAIL_EXISTS],
                { email: [errorMessages.EMAIL_EXISTS] }
            ); 
        }
        
        const phoneExists = await UserModel.findOne({ where: { phone: additionalData.phone } });
        if (phoneExists) {
            throw ApiError.BadRequest(
                errorMessages.PHONE_EXISTS,
                [errorMessages.PHONE_EXISTS],
                { phone: [errorMessages.PHONE_EXISTS] }
            );
        }
        
        const hashPassword = await bcrypt.hash(password, 3);
        
        const user = await UserModel.create({
            email, 
            password: hashPassword,
            last_name: additionalData.last_name,
            first_name: additionalData.first_name,
            second_name: additionalData.second_name,
            birthday: additionalData.birthday,
            region: additionalData.region,
            city: additionalData.city,
            school: additionalData.school,
            programming_language: additionalData.programming_language,
            phone: additionalData.phone,
            grade: additionalData.grade
        });
        
        const userDto = new UserDto(user);

        // Генерируем UUID activation токен (7 дней = 10080 минут)
        const activationToken = await tokenService.generateUuidToken(user.id, 'activation');
        
        // Отправляем письмо с активацией
        try {
            await mailService.sendActivationMail(
                email, 
                `${process.env.URL}/api/activate/${activationToken}`
            );
        } catch (e) {
            // Если письмо не отправилось, удаляем созданного пользователя и токены
            await tokenService.removeToken(activationToken, 'activation');
            await user.destroy();
            throw ApiError.InternalError(
                'Ошибка отправки письма активации. Попробуйте зарегистрироваться позже.',
                ['Ошибка отправки email']
            );
        }

        return {
            success: true,
            message: 'Пожалуйста, проверьте вашу почту для активации аккаунта'
        }
    }

    async activate(activationToken){
        // Валидируем UUID токен (7 дней = 10080 минут)
        const tokenData = await tokenService.validateUuidToken(activationToken, 'activation', 10080);
        
        if (!tokenData) {
            throw ApiError.BadRequest(
                'Ссылка активации недействительна или истекла',
                ['Ссылка активации недействительна или истекла']
            );
        }
        
        // Находим пользователя
        const user = await UserModel.findByPk(tokenData.userId);
        
        if (!user){
            throw ApiError.BadRequest(
                'Пользователь не найден',
                ['Пользователь не найден']
            );
        }
        
        if (user.isActivated) {
            throw ApiError.BadRequest(
                'Аккаунт уже активирован',
                ['Аккаунт уже активирован']
            );
        }
        
        // Активируем пользователя
        user.isActivated = true;
        await user.save();
        
        // Удаляем токен активации
        await tokenService.removeToken(activationToken, 'activation');
    }

    async login(email, password){
        const user = await UserModel.findOne({where : {email}});
        if(!user){
            throw ApiError.BadRequest(
                errorMessages.EMAIL_NOT_FOUND,
                [errorMessages.EMAIL_NOT_FOUND],
                { email: [errorMessages.EMAIL_NOT_FOUND] }
            )
        }

        if (!user.isActivated) {
            throw ApiError.BadRequest(
                'Аккаунт не активирован. Пожалуйста, проверьте вашу почту и активируйте аккаунт.',
                ['Аккаунт не активирован. Пожалуйста, проверьте вашу почту и активируйте аккаунт.']
            )
        }

        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if (!isPasswordEquals){
            throw ApiError.BadRequest(
                errorMessages.PASSWORD_INCORRECT,
                [errorMessages.PASSWORD_INCORRECT],
                { password: [errorMessages.PASSWORD_INCORRECT] }
            )
        }

        const userDto = new UserDto(user);

        const accessToken = tokenService.generateToken(
            { ...userDto }, 
            'access', 
            '1m'
        );
        
        const refreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '3m'
        );
        
        await tokenService.saveToken(userDto.id, refreshToken, 'refresh');
        
        return {
            accessToken,
            refreshToken,
            user: userDto
        }
    }

    async logout(refreshToken){
        if (!refreshToken) {
            // Если токена нет, просто возвращаем успех
            return { success: true };
        }
        
        const token = await tokenService.removeToken(refreshToken, 'refresh');
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        
        const userData = tokenService.validateToken(refreshToken, 'refresh');
        
        const tokenFromDb = await tokenService.findToken(refreshToken, 'refresh');
        
        if (!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError();
        }
        
        const user = await UserModel.findByPk(userData.id);
        
        if (!user) {
            // Пользователь удален, удаляем токен
            await tokenService.removeToken(refreshToken, 'refresh');
            throw ApiError.UnauthorizedError();
        }
        
        const userDto = new UserDto(user);
        
        const accessToken = tokenService.generateToken(
            { ...userDto }, 
            'access', 
            '1m'
        );
        
        const newRefreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '3m'
        );
        
        // Удаляем старый refresh token перед сохранением нового (защита от replay атак)
        await tokenService.removeToken(refreshToken, 'refresh');
        await tokenService.saveToken(userDto.id, newRefreshToken, 'refresh');
        
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: userDto
        }
    }

    async requestPasswordReset(email) {
        const user = await UserModel.findOne({ where: { email } });
        
        if (!user) {
            throw ApiError.BadRequest(
                errorMessages.EMAIL_NOT_FOUND,
                [errorMessages.EMAIL_NOT_FOUND],
                { email: [errorMessages.EMAIL_NOT_FOUND] }
            )
        }

        if (!user.isActivated) {
            throw ApiError.BadRequest(
                'Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт по ссылке из письма.',
                ['Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт по ссылке из письма.']
            );
        }

        // Удаляем старые reset токены пользователя перед созданием нового
        await tokenService.removeAllUserTokens(user.id, 'reset');

        // Генерируем UUID reset токен (15 минут)
        const resetToken = await tokenService.generateUuidToken(user.id, 'reset');

        const resetLink = `${process.env.URL}/reset-password?token=${resetToken}`;
        
        mailService.sendResetMail(email, resetLink);

        return { success: true };
    }

    async resetPassword(token, newPassword) {
        // Валидируем UUID токен (15 минут)
        const tokenData = await tokenService.validateUuidToken(token, 'reset', 15);
        
        if (!tokenData) {
            throw ApiError.BadRequest(
                'Ссылка для сброса пароля недействительна или истекла',
                ['Ссылка для сброса пароля недействительна или истекла']
            );
        }

        const user = await UserModel.findByPk(tokenData.userId);
        
        if (!user) {
            throw ApiError.BadRequest(
                'Пользователь не найден',
                ['Пользователь не найден']
            );
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
        if (!passwordRegex.test(newPassword)) {
            throw ApiError.BadRequest(
                errorMessages.PASSWORD_COMPLEXITY,
                [errorMessages.PASSWORD_COMPLEXITY],
                { newPassword: [errorMessages.PASSWORD_COMPLEXITY] }
            );
        }

        if (!user.isActivated) {
            throw ApiError.BadRequest(
                'Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт',
                ['Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт']
            );
        }

        const hashPassword = await bcrypt.hash(newPassword, 3);
        user.password = hashPassword;
        await user.save();

        // Удаляем reset токен
        await tokenService.removeToken(token, 'reset');
        
        // Удаляем все refresh токены пользователя для безопасности
        // (если пароль был скомпрометирован, все сессии должны быть закрыты)
        await tokenService.removeAllUserTokens(user.id, 'refresh');

        return { success: true };
    }

    async getAllUsers(){
        const users = await UserModel.findAll();
        return users;
    }

    async getProfile(userId) {
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        // Возвращаем полную информацию о пользователе (включая teamId и isLead)
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            second_name: user.second_name,
            teamId: user.teamId,
            isLead: user.isLead,
            isActivated: user.isActivated
        };
    }
}

module.exports = new UserService();