const TeamModel = require('../models/team-model');
const UserModel = require('../models/user-model');
const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');

class TeamService {
    // Создание команды
    async createTeam(name, userId) {
        const existingTeam = await TeamModel.findOne({ where: { name } });
        if (existingTeam) {
            throw ApiError.BadRequest(
                'Команда с таким названием уже существует',
                ['Команда с таким названием уже существует'],
                { name: ['Команда с таким названием уже существует'] }
            );
        }

        const user = await UserModel.findByPk(userId);
        if (user.teamId) {
            throw ApiError.BadRequest(
                'Вы уже состоите в команде',
                ['Вы уже состоите в команде']
            );
        }

        // Валидация названия (кириллица, латиница, цифры)
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

        // Генерируем уникальный токен приглашения
        const inviteToken = uuid.v4();

        // Создаем команду
        const team = await TeamModel.create({
            name,
            inviteToken
        });

        // Устанавливаем пользователю teamId и isLead
        user.teamId = team.id;
        user.isLead = true;
        await user.save();

        // Получаем информацию о команде
        return await this.getTeamInfo(team.id);
    }

    // Присоединение к команде по токену
    async joinTeam(inviteToken, userId) {
        // Находим команду по токену
        const team = await TeamModel.findOne({ where: { inviteToken } });
        if (!team) {
            throw ApiError.BadRequest(
                'Команда не найдена или ссылка недействительна',
                ['Команда не найдена или ссылка недействительна']
            );
        }

        // Проверяем, что пользователь не состоит в другой команде
        const user = await UserModel.findByPk(userId);
        if (user.teamId) {
            throw ApiError.BadRequest(
                'Вы уже состоите в команде. Сначала выйдите из текущей команды.',
                ['Вы уже состоите в команде. Сначала выйдите из текущей команды.']
            );
        }

        // Проверяем количество участников
        const memberCount = await UserModel.count({ where: { teamId: team.id } });
        if (memberCount >= 3) {
            throw ApiError.BadRequest(
                'В команде уже максимальное количество участников (3)',
                ['В команде уже максимальное количество участников (3)']
            );
        }

        // Добавляем пользователя в команду
        user.teamId = team.id;
        user.isLead = false;
        await user.save();

        // Возвращаем информацию о команде
        return await this.getTeamInfo(team.id);
    }

    // Получение информации о команде
    async getTeamInfo(teamId) {
        const team = await TeamModel.findByPk(teamId);
        if (!team) {
            throw ApiError.BadRequest('Команда не найдена', ['Команда не найдена']);
        }

        // Получаем всех участников
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

    // Получение команды пользователя
    async getUserTeam(userId) {
        const user = await UserModel.findByPk(userId);
        if (!user.teamId) {
            return null;
        }

        return await this.getTeamInfo(user.teamId);
    }

    // Выход из команды
    async leaveTeam(userId) {
        const user = await UserModel.findByPk(userId);
        
        // Если пользователь уже не в команде (например, команда была удалена капитаном),
        // возвращаем успех (идемпотентная операция)
        if (!user.teamId) {
            return { success: true, message: 'Вы не состоите в команде' };
        }

        // Если это лидер, запрещаем выход (он должен удалить команду)
        if (user.isLead) {
            throw ApiError.BadRequest(
                'Лидер не может выйти из команды. Удалите команду или передайте лидерство.',
                ['Лидер не может выйти из команды. Удалите команду или передайте лидерство.']
            );
        }

        // Удаляем пользователя из команды
        user.teamId = null;
        user.isLead = false;
        await user.save();

        return { success: true, message: 'Вы успешно покинули команду' };
    }

    // Исключение участника (только для лидера)
    async kickMember(leaderId, memberUserId) {
        const leader = await UserModel.findByPk(leaderId);
        
        // Проверяем, что пользователь является лидером команды
        if (!leader.teamId || !leader.isLead) {
            throw ApiError.BadRequest(
                'У вас нет прав для этого действия',
                ['У вас нет прав для этого действия']
            );
        }

        // Нельзя исключить самого себя
        if (leaderId === memberUserId) {
            throw ApiError.BadRequest(
                'Нельзя исключить себя из команды',
                ['Нельзя исключить себя из команды']
            );
        }

        // Проверяем, что пользователь состоит в той же команде
        const member = await UserModel.findByPk(memberUserId);
        if (!member) {
            throw ApiError.BadRequest(
                'Пользователь не найден',
                ['Пользователь не найден']
            );
        }

        // Если пользователь уже не в команде (например, вышел самостоятельно),
        // возвращаем успех (идемпотентная операция)
        if (member.teamId !== leader.teamId) {
            return { success: true, message: 'Участник уже не состоит в команде' };
        }

        // Удаляем участника из команды
        member.teamId = null;
        member.isLead = false;
        await member.save();

        return { success: true, message: 'Участник исключен из команды' };
    }

    // Удаление команды (только для лидера)
    async deleteTeam(leaderId) {
        const leader = await UserModel.findByPk(leaderId);
        
        if (!leader.teamId || !leader.isLead) {
            throw ApiError.BadRequest(
                'У вас нет команды или вы не являетесь лидером',
                ['У вас нет команды или вы не являетесь лидером']
            );
        }

        const teamId = leader.teamId;

        // Удаляем всех участников из команды (устанавливаем teamId в null)
        await UserModel.update(
            { teamId: null, isLead: false },
            { where: { teamId } }
        );

        // Удаляем команду
        await TeamModel.destroy({ where: { id: teamId } });

        return { success: true, message: 'Команда успешно удалена' };
    }
}

module.exports = new TeamService();
