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
        
        const activationLink = uuid.v4();
        
        try {
            await mailService.sendActivationMail(email, `${process.env.URL}/api/activate/${activationLink}`);
        } catch (error) {
            if (error.message.includes('invalid mailbox')) {
                throw ApiError.BadRequest(
                    'Указанный email не существует или недоступен',
                    ['Указанный email не существует или недоступен'],
                    { email: ['Указанный email не существует или недоступен'] }
                );
            }
            throw ApiError.BadRequest(
                'Ошибка отправки письма активации. Пожалуйста, проверьте email',
                [error.message],
                { email: ['Ошибка отправки письма активации'] }
            );
        }
        
        const hashPassword = await bcrypt.hash(password, 3);
        
        const user = await UserModel.create({
            email, 
            password: hashPassword, 
            activationLink,
            last_name: additionalData.last_name,
            first_name: additionalData.first_name,
            second_name: additionalData.second_name,
            birthday: additionalData.birthday,
            region: additionalData.region,
            city: additionalData.city,
            school: additionalData.school,
            programming_language: additionalData.programming_language,
            phone: additionalData.phone,
            format: additionalData.format,
            grade: additionalData.grade
        });
        
        const userDto = new UserDto(user);

        const accessToken = tokenService.generateToken(
            { ...userDto }, 
            'access', 
            '10s'
        );
        
        const refreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '30s'
        );
        
        await tokenService.saveToken(userDto.id, refreshToken, 'refresh');

        return {
            accessToken,
            refreshToken,
            user: userDto
        }
    }

    async activate(activationLink){
        const user = await UserModel.findOne({ where : {activationLink}})
        if (!user){
            throw ApiError.BadRequest(errorMessages.ACTIVATION_LINK_INVALID)
        }
        user.isActivated = true;
        await user.save();
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
                ['Аккаунт не активирован'],
                { general: ['Аккаунт не активирован'] }
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
            '10s'
        );
        
        const refreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '30s'
        );
        
        await tokenService.saveToken(userDto.id, refreshToken, 'refresh');
        
        return {
            accessToken,
            refreshToken,
            user: userDto
        }
    }

    async logout(refreshToken){
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
        const userDto = new UserDto(user);
        
        const accessToken = tokenService.generateToken(
            { ...userDto }, 
            'access', 
            '10s'
        );
        
        const newRefreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '30s'
        );
        
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
            throw ApiError.BadRequest('Аккаунт не активирован');
        }

        const resetToken = tokenService.generateToken(
            { 
                userId: user.id,
                email: user.email 
            }, 
            'reset', 
            '30s'
        );
        
        await tokenService.saveToken(user.id, resetToken, 'reset');

        const resetLink = `${process.env.URL}/reset-password?token=${resetToken}`;
        
        mailService.sendResetMail(email, resetLink);

        return { success: true };
    }

    async resetPassword(token, newPassword) {
        const tokenData = tokenService.validateToken(token, 'reset');
        
        if (!tokenData) {
            throw ApiError.BadRequest('Ссылка недействительна');
        }

        const tokenInDb = await tokenService.findToken(token, 'reset');
        
        if (!tokenInDb) {
            throw ApiError.BadRequest('Токен не найден');
        }

        const user = await UserModel.findByPk(tokenData.userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
        if (!passwordRegex.test(newPassword)) {
            throw ApiError.BadRequest(
                'Пароль должен содержать от 8 до 32 символов, включая хотя бы одну заглавную букву, одну строчную букву и одну цифру'
            );
        }

        const hashPassword = await bcrypt.hash(newPassword, 3);
        user.password = hashPassword;
        await user.save();

        await tokenService.removeToken(token, 'reset');

        return { success: true };
    }

    async getAllUsers(){
        const users = await UserModel.findAll();
        return users;
    }
}

module.exports = new UserService();