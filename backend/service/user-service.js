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
        const activationLink = uuid.v4();

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
        
        await mailService.sendActivationMail(email, `${process.env.URL}/api/activate/${activationLink}`);
        
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
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

        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if (!isPasswordEquals){
            throw ApiError.BadRequest(
                errorMessages.PASSWORD_INCORRECT,
                [errorMessages.PASSWORD_INCORRECT],
                { password: [errorMessages.PASSWORD_INCORRECT] }
            )
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError();
        }
        
        const user = await UserModel.findByPk(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async getAllUsers(){
        const users = await UserModel.findAll();
        return users;
    }
}

module.exports = new UserService();