const UserModel = require('../models/user-model');
const SettingsModel = require('../models/settings-model');
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

        // Эссе видно от начала регистрации до даты закрытия эссе
        const [regStartSetting, essayCloseSetting] = await Promise.all([
            SettingsModel.findOne({ where: { key: 'registration_start' } }),
            SettingsModel.findOne({ where: { key: 'essay_close_date' } })
        ]);
        const now = new Date();
        const regStarted = !regStartSetting?.value || now >= new Date(regStartSetting.value);
        const essayNotClosed = !essayCloseSetting?.value || now <= new Date(essayCloseSetting.value);
        const essay_visible = regStarted && essayNotClosed;

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
            essayUrl: user.essayUrl,
            essay_visible
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

    async updateProfile(userId, profileData, editedBy = null) {
        const ProfileHistoryModel = require('../models/profile-history-model');
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        // Проверяем, не занят ли телефон другим пользователем
        if (profileData.phone && profileData.phone !== user.phone) {
            const phoneExists = await UserModel.findOne({ 
                where: { 
                    phone: profileData.phone,
                    id: { [require('sequelize').Op.ne]: userId }
                } 
            });
            if (phoneExists) {
                throw ApiError.BadRequest(
                    errorMessages.PHONE_EXISTS,
                    [errorMessages.PHONE_EXISTS],
                    { phone: [errorMessages.PHONE_EXISTS] }
                );
            }
        }

        // Собираем изменения для истории
        const changes = {};
        const fieldsToTrack = ['last_name', 'first_name', 'second_name', 'birthday', 'region', 'city', 'school', 'programming_language', 'phone', 'grade'];
        
        fieldsToTrack.forEach(field => {
            const oldValue = user[field];
            const newValue = field === 'grade' ? parseInt(profileData[field]) : profileData[field];
            
            if (oldValue !== newValue) {
                changes[field] = {
                    old: oldValue,
                    new: newValue
                };
            }
        });

        // Обновляем поля
        user.last_name = profileData.last_name;
        user.first_name = profileData.first_name;
        user.second_name = profileData.second_name || null;
        user.birthday = profileData.birthday;
        user.region = profileData.region;
        user.city = profileData.city;
        user.school = profileData.school;
        user.programming_language = profileData.programming_language;
        user.phone = profileData.phone;
        user.grade = parseInt(profileData.grade);

        await user.save();

        // Сохраняем историю изменений, если есть изменения и указан редактор
        if (Object.keys(changes).length > 0 && editedBy) {
            await ProfileHistoryModel.create({
                userId: userId,
                editedBy: editedBy,
                changes: changes
            });
        }

        return {
            success: true,
            message: 'Профиль успешно обновлен'
        };
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

    /**
     * Создать волонтера (только для админа)
     */
    async createVolunteer(email, password, firstName, lastName, secondName = null) {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            throw ApiError.BadRequest(
                'Пользователь с таким email уже существует',
                ['Пользователь с таким email уже существует'],
                { email: ['Пользователь с таким email уже существует'] }
            );
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 3);

        // Создаем волонтера
        const volunteer = await UserModel.create({
            email,
            password: hashedPassword,
            role: 'volunteer',
            isActivated: true, // Волонтеры активируются сразу
            first_name: firstName,
            last_name: lastName,
            second_name: secondName,
            // Заполняем обязательные поля значениями по умолчанию
            birthday: '2000-01-01',
            region: 'Не указано',
            city: 'Не указано',
            school: 'Волонтер',
            programming_language: 'Не указано',
            phone: '+70000000000',
            grade: 11,
            participation_format: 'individual'
        });

        return {
            success: true,
            message: 'Волонтер успешно создан',
            volunteer: {
                id: volunteer.id,
                email: volunteer.email,
                firstName: volunteer.first_name,
                lastName: volunteer.last_name,
                secondName: volunteer.second_name,
                role: volunteer.role
            }
        };
    }

    /**
     * Получить список всех волонтеров
     */
    async getVolunteers() {
        const volunteers = await UserModel.findAll({
            where: { role: 'volunteer' },
            attributes: ['id', 'email', 'first_name', 'last_name', 'second_name', 'isActivated']
        });

        return volunteers.map(v => ({
            id: v.id,
            email: v.email,
            firstName: v.first_name,
            lastName: v.last_name,
            secondName: v.second_name,
            fullName: `${v.last_name} ${v.first_name} ${v.second_name || ''}`.trim(),
            isActivated: v.isActivated
        }));
    }

    /**
     * Удалить волонтера
     */
    async deleteVolunteer(volunteerId) {
        const volunteer = await UserModel.findByPk(volunteerId);

        if (!volunteer) {
            throw ApiError.BadRequest('Волонтер не найден');
        }

        if (volunteer.role !== 'volunteer') {
            throw ApiError.BadRequest('Пользователь не является волонтером');
        }

        await volunteer.destroy();

        return {
            success: true,
            message: 'Волонтер успешно удален'
        };
    }

    /**
     * Обновить пароль волонтера
     */
    async updateVolunteerPassword(volunteerId, newPassword) {
        const volunteer = await UserModel.findByPk(volunteerId);

        if (!volunteer) {
            throw ApiError.BadRequest('Волонтер не найден');
        }

        if (volunteer.role !== 'volunteer') {
            throw ApiError.BadRequest('Пользователь не является волонтером');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 3);
        volunteer.password = hashedPassword;
        await volunteer.save();

        return {
            success: true,
            message: 'Пароль волонтера успешно обновлен'
        };
    }

    async getProfileHistory(userId) {
        const ProfileHistoryModel = require('../models/profile-history-model');
        
        const history = await ProfileHistoryModel.findAll({
            where: { userId },
            include: [{
                model: UserModel,
                as: 'EditedByUser',
                attributes: ['id', 'first_name', 'last_name', 'second_name', 'role'],
                required: false
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        return history.map(record => ({
            id: record.id,
            changes: record.changes,
            createdAt: record.createdAt,
            editedBy: record.EditedByUser ? {
                id: record.EditedByUser.id,
                name: `${record.EditedByUser.last_name} ${record.EditedByUser.first_name} ${record.EditedByUser.second_name || ''}`.trim(),
                role: record.EditedByUser.role
            } : null
        }));
    }
}

module.exports = new UserService();