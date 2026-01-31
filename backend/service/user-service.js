const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const mailService = require('./mail-service');
const ApiError = require('../exceptions/api-error');
const errorMessages = require('../validation/error-messages');
const sequelize = require('../db');

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
            grade: additionalData.grade,
            participation_format: additionalData.participation_format
        });
        
        const userDto = new UserDto(user);

        const activationToken = await tokenService.generateUuidToken(user.id, 'activation');
        
        // Отправка письма активации
        try {
            await mailService.sendActivationMail(
                email, 
                `${process.env.URL}/api/activate/${activationToken}`
            );
        } catch (e) {
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

    async activate(activationToken) {
        const tokenData = await tokenService.validateUuidToken(activationToken, 'activation', 10080);
        
        if (!tokenData) {
            throw ApiError.BadRequest(
                'Ссылка активации недействительна или истекла',
                ['Ссылка активации недействительна или истекла']
            );
        }
        
        const user = await UserModel.findByPk(tokenData.userId);
        
        if (!user) {
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
        
        user.isActivated = true;
        await user.save();
        
        await tokenService.removeToken(activationToken, 'activation');
    }

    async login(email, password) {
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
                'Аккаунт не активирован. Пожалуйста, проверьте вашу почту и активируйте аккаунт.',
                ['Аккаунт не активирован. Пожалуйста, проверьте вашу почту и активируйте аккаунт.']
            )
        }

        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if (!isPasswordEquals) {
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
            '15m'
        );
        
        const refreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '30d'
        );
        
        await tokenService.saveToken(userDto.id, refreshToken, 'refresh');
        
        return {
            accessToken,
            refreshToken,
            user: userDto
        }
    }

    async logout(refreshToken) {
        if (!refreshToken) {
            return { success: true };
        }
        
        const token = await tokenService.removeToken(refreshToken, 'refresh');
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        
        const userData = tokenService.validateToken(refreshToken, 'refresh');
        
        const tokenFromDb = await tokenService.findToken(refreshToken, 'refresh');
        
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        
        const user = await UserModel.findByPk(userData.id);
        
        if (!user) {
            await tokenService.removeToken(refreshToken, 'refresh');
            throw ApiError.UnauthorizedError();
        }
        
        const userDto = new UserDto(user);
        
        const accessToken = tokenService.generateToken(
            { ...userDto }, 
            'access', 
            '15m'
        );
        
        const newRefreshToken = tokenService.generateToken(
            { ...userDto }, 
            'refresh', 
            '30d'
        );
        
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
            );
        }

        if (!user.isActivated) {
            throw ApiError.BadRequest(
                'Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт по ссылке из письма.',
                ['Аккаунт не активирован. Пожалуйста, сначала активируйте аккаунт по ссылке из письма.']
            );
        }

        await tokenService.removeAllUserTokens(user.id, 'reset');

        const resetToken = await tokenService.generateUuidToken(user.id, 'reset');

        const resetLink = `${process.env.URL}/reset-password?token=${resetToken}`;
        
        mailService.sendResetMail(email, resetLink);

        return { success: true };
    }

    async resetPassword(token, newPassword) {
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

        await tokenService.removeToken(token, 'reset');
        await tokenService.removeAllUserTokens(user.id, 'refresh');

        return { success: true };
    }

    async getAllUsers() {
        const users = await UserModel.findAll();
        return users;
    }

    async getProfile(userId) {
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        // isLead убран - получать из team.members, чтобы избежать дублирования данных
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            second_name: user.second_name,
            phone: user.phone,
            school: user.school,
            city: user.city,
            region: user.region,
            grade: user.grade,
            birthday: user.birthday,
            programming_language: user.programming_language,
            teamId: user.teamId, // Оставляем для оптимизации (понять, нужно ли запрашивать команду)
            isActivated: user.isActivated,
            participation_format: user.participation_format,
            role: user.role,
            place: user.place,
            certificateId: user.certificateId,
            essayUrl: user.essayUrl
        };
    }

    async updateParticipationFormat(userId, newFormat) {
        const transaction = await sequelize.transaction();
        
        try {
            const user = await UserModel.findByPk(userId, { transaction });
            
            if (!user) {
                throw ApiError.BadRequest('Пользователь не найден');
            }

            // Валидация формата
            if (!['individual', 'team'].includes(newFormat)) {
                throw ApiError.BadRequest('Неверный формат участия');
            }

            if (newFormat === 'individual' && user.teamId) {
                const TeamModel = require('../models/team-model');
                const team = await TeamModel.findByPk(user.teamId, { transaction });
                
                if (team) {
                    if (user.isLead) {
                        await UserModel.update(
                            { teamId: null, isLead: false },
                            { where: { teamId: team.id }, transaction }
                        );
                        
                        await team.destroy({ transaction });
                    } else {
                        user.teamId = null;
                        user.isLead = false;
                    }
                } else {
                    user.teamId = null;
                    user.isLead = false;
                }
            }

            user.participation_format = newFormat;
            await user.save({ transaction });

            await transaction.commit();
            
            return {
                success: true,
                message: newFormat === 'individual' 
                    ? 'Формат участия изменен на индивидуальное' 
                    : 'Формат участия изменен на командное'
            };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateEssayUrl(userId, essayUrl) {
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        // Проверка: только для индивидуальных участников или лидеров команды
        if (user.participation_format === 'individual') {
            // Индивидуальный участник - разрешено
            user.essayUrl = essayUrl;
            await user.save();
            
            return {
                success: true,
                message: 'Ссылка на эссе успешно обновлена'
            };
        } else if (user.participation_format === 'team') {
            // Командный формат - проверяем, является ли лидером
            if (!user.isLead) {
                throw ApiError.BadRequest('Только лидер команды может загружать эссе');
            }
            
            user.essayUrl = essayUrl;
            await user.save();
            
            return {
                success: true,
                message: 'Ссылка на эссе успешно обновлена'
            };
        }

        throw ApiError.BadRequest('Не удалось обновить ссылку на эссе');
    }

    async setUserResult(userId, place, certificateId) {
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        if (place !== null && place !== undefined) {
            user.place = place;
        }

        if (certificateId !== null && certificateId !== undefined) {
            user.certificateId = certificateId;
        }

        await user.save();

        return {
            success: true,
            message: 'Результаты успешно обновлены'
        };
    }
}

module.exports = new UserService();