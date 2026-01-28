const TeamModel = require('../models/team-model');
const UserModel = require('../models/user-model');
const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const sequelize = require('../db');

class TeamService {
    async createTeam(name, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const user = await UserModel.findByPk(userId, { transaction });
            
            if (!user) {
                throw ApiError.BadRequest('Пользователь не найден', ['Пользователь не найден']);
            }
            
            // Проверяем активацию аккаунта
            if (!user.isActivated) {
                throw ApiError.BadRequest(
                    'Аккаунт не активирован. Пожалуйста, проверьте почту и активируйте аккаунт.',
                    ['Аккаунт не активирован. Пожалуйста, проверьте почту и активируйте аккаунт.']
                );
            }
            
            // Проверяем формат участия
            if (user.participation_format === 'individual') {
                throw ApiError.BadRequest(
                    'У вас выбран индивидуальный формат участия. Измените формат на командный в профиле, чтобы создать команду.',
                    ['У вас выбран индивидуальный формат участия. Измените формат на командный в профиле, чтобы создать команду.']
                );
            }
            
            if (user.teamId) {
                throw ApiError.BadRequest(
                    'Вы уже состоите в команде',
                    ['Вы уже состоите в команде']
                );
            }

            const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/;
            if (!nameRegex.test(name)) {
                throw ApiError.BadRequest(
                    'Название команды может содержать только буквы (русские/английские) и цифры',
                    ['Название команды может содержать только буквы (русские/английские) и цифры'],
                    { name: ['Название команды может содержать только буквы (русские/английские) и цифры'] }
                );
            }

            if (name.length < 3 || name.length > 50) {
                throw ApiError.BadRequest(
                    'Название команды должно быть от 3 до 50 символов',
                    ['Название команды должно быть от 3 до 50 символов'],
                    { name: ['Название команды должно быть от 3 до 50 символов'] }
                );
            }

            const inviteToken = uuid.v4();

            let team;
            try {
                team = await TeamModel.create({
                    name,
                    inviteToken
                }, { transaction });
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw ApiError.BadRequest(
                        'Команда с таким названием уже существует',
                        ['Команда с таким названием уже существует'],
                        { name: ['Команда с таким названием уже существует'] }
                    );
                }
                throw error;
            }

            user.teamId = team.id;
            user.isLead = true;
            await user.save({ transaction });

            await transaction.commit();
            
            return await this.getTeamInfo(team.id);
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async joinTeam(inviteToken, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const team = await TeamModel.findOne({ 
                where: { inviteToken },
                transaction 
            });
            
            if (!team) {
                throw ApiError.BadRequest(
                    'Команда не найдена или ссылка недействительна',
                    ['Команда не найдена или ссылка недействительна']
                );
            }

            const user = await UserModel.findByPk(userId, { transaction });
            
            if (!user) {
                throw ApiError.BadRequest('Пользователь не найден', ['Пользователь не найден']);
            }
            
            // Проверяем активацию аккаунта
            if (!user.isActivated) {
                throw ApiError.BadRequest(
                    'Аккаунт не активирован. Пожалуйста, проверьте почту и активируйте аккаунт.',
                    ['Аккаунт не активирован. Пожалуйста, проверьте почту и активируйте аккаунт.']
                );
            }
            
            // Проверяем формат участия
            if (user.participation_format === 'individual') {
                throw ApiError.BadRequest(
                    'У вас выбран индивидуальный формат участия. Измените формат на командный в профиле, чтобы присоединиться к команде.',
                    ['У вас выбран индивидуальный формат участия. Измените формат на командный в профиле, чтобы присоединиться к команде.']
                );
            }
            
            if (user.teamId) {
                throw ApiError.BadRequest(
                    'Вы уже состоите в команде. Сначала выйдите из текущей команды.',
                    ['Вы уже состоите в команде. Сначала выйдите из текущей команды.']
                );
            }

            user.teamId = team.id;
            user.isLead = false;
            await user.save({ transaction });

            const memberCount = await UserModel.count({ 
                where: { teamId: team.id },
                transaction 
            });
            
            if (memberCount > 3) {
                throw ApiError.BadRequest(
                    'В команде уже максимальное количество участников (3)',
                    ['В команде уже максимальное количество участников (3)']
                );
            }

            await transaction.commit();
            
            return await this.getTeamInfo(team.id);
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getTeamInfo(teamId) {
        const team = await TeamModel.findByPk(teamId);
        if (!team) {
            throw ApiError.BadRequest('Команда не найдена', ['Команда не найдена']);
        }

        const members = await UserModel.findAll({
            where: { teamId },
            attributes: ['id', 'email', 'first_name', 'last_name', 'second_name', 'isLead']
        });

        return {
            id: team.id,
            name: team.name,
            inviteLink: `${process.env.URL}/api/team/join/${team.inviteToken}`,
            members: members,
            memberCount: members.length,
            createdAt: team.createdAt
        };
    }

    async getUserTeam(userId) {
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            throw ApiError.BadRequest(
                'Пользователь не найден',
                ['Пользователь не найден']
            );
        }
        
        if (!user.teamId) {
            return null;
        }

        return await this.getTeamInfo(user.teamId);
    }

    async leaveTeam(userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const user = await UserModel.findByPk(userId, { transaction });
            
            if (!user) {
                throw ApiError.BadRequest(
                    'Пользователь не найден',
                    ['Пользователь не найден']
                );
            }
            
            if (!user.teamId) {
                throw ApiError.BadRequest(
                    'Вы не состоите в команде',
                    ['Вы не состоите в команде']
                );
            }

            if (user.isLead) {
                throw ApiError.BadRequest(
                    'Лидер не может выйти из команды. Удалите команду или передайте лидерство.',
                    ['Лидер не может выйти из команды. Удалите команду или передайте лидерство.']
                );
            }

            user.teamId = null;
            user.isLead = false;
            await user.save({ transaction });

            await transaction.commit();
            
            return { success: true, message: 'Вы успешно покинули команду' };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async kickMember(leaderId, memberUserId) {
        const transaction = await sequelize.transaction();
        
        try {
            const leader = await UserModel.findByPk(leaderId, { transaction });
            
            if (!leader) {
                throw ApiError.BadRequest(
                    'Пользователь не найден',
                    ['Пользователь не найден']
                );
            }
            
            if (!leader.teamId) {
                throw ApiError.BadRequest(
                    'Вы не состоите в команде',
                    ['Вы не состоите в команде']
                );
            }
            
            if (!leader.isLead) {
                throw ApiError.BadRequest(
                    'Только лидер команды может исключать участников',
                    ['Только лидер команды может исключать участников']
                );
            }

            if (leaderId === memberUserId) {
                throw ApiError.BadRequest(
                    'Нельзя исключить себя из команды',
                    ['Нельзя исключить себя из команды']
                );
            }

            const member = await UserModel.findByPk(memberUserId, { transaction });
            if (!member) {
                throw ApiError.BadRequest(
                    'Пользователь не найден',
                    ['Пользователь не найден']
                );
            }

            if (!member.teamId) {
                throw ApiError.BadRequest(
                    'Указанный пользователь не состоит ни в одной команде',
                    ['Указанный пользователь не состоит ни в одной команде']
                );
            }
            
            if (member.teamId !== leader.teamId) {
                throw ApiError.BadRequest(
                    'Указанный пользователь не является участником вашей команды',
                    ['Указанный пользователь не является участником вашей команды']
                );
            }

            member.teamId = null;
            member.isLead = false;
            await member.save({ transaction });

            await transaction.commit();
            
            return { success: true, message: 'Участник исключен из команды' };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteTeam(leaderId) {
        const transaction = await sequelize.transaction();
        
        try {
            const leader = await UserModel.findByPk(leaderId, { transaction });
            
            if (!leader) {
                throw ApiError.BadRequest('Пользователь не найден', ['Пользователь не найден']);
            }
            
            if (!leader.teamId || !leader.isLead) {
                throw ApiError.BadRequest(
                    'У вас нет команды или вы не являетесь лидером',
                    ['У вас нет команды или вы не являетесь лидером']
                );
            }

            const teamId = leader.teamId;

            await TeamModel.destroy({ where: { id: teamId }, transaction });

            await transaction.commit();
            
            return { success: true, message: 'Команда успешно удалена' };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Получить все команды с участниками (для админки)
    async getAllTeams() {
        const allTeams = await TeamModel.findAll({
            order: [['createdAt', 'ASC']]
        });

        const teamsWithMembers = await Promise.all(
            allTeams.map(async (team) => {
                const members = await UserModel.findAll({
                    where: { teamId: team.id },
                    attributes: ['id', 'first_name', 'last_name', 'second_name', 'isLead', 'school', 'email', 'grade', 'programming_language', 'essayUrl'],
                    order: [['isLead', 'DESC'], ['last_name', 'ASC']]
                });

                return {
                    id: team.id,
                    name: team.name,
                    members: members,
                    memberCount: members.length,
                    createdAt: team.createdAt
                };
            })
        );

        return teamsWithMembers;
    }
}

module.exports = new TeamService();
