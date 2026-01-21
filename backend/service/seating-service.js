const SeatingAssignmentModel = require('../models/seating-assignment-model');
const RoomModel = require('../models/room-model');
const TeamModel = require('../models/team-model');
const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const { Op } = require('sequelize');

class SeatingService {
    /**
     * Автоматическая рассадка команд и индивидуальных участников
     * Правила:
     * 1. Команды из одной школы не должны быть в одном кабинете
     * 2. Количество мест = количество людей (не команд)
     */
    async autoAssignSeating() {
        const transaction = await require('../db').transaction();

        try {
            // Очищаем предыдущую рассадку
            await SeatingAssignmentModel.destroy({ where: {}, transaction });

            // Получаем все аудитории, отсортированные по номеру
            const rooms = await RoomModel.findAll({
                order: [['number', 'ASC']],
                transaction
            });

            if (rooms.length === 0) {
                throw ApiError.BadRequest('Нет доступных аудиторий. Сначала добавьте аудитории.');
            }

            // Получаем все команды с участниками
            const teams = await TeamModel.findAll({
                include: [{
                    model: UserModel,
                    as: 'Members',
                    attributes: ['id', 'school', 'first_name', 'last_name', 'second_name', 'isLead'],
                    where: { role: 'participant' }
                }],
                transaction
            });

            // Получаем индивидуальных участников (без команды)
            const individualParticipants = await UserModel.findAll({
                where: {
                    role: 'participant',
                    teamId: null,
                    participation_format: 'individual'
                },
                attributes: ['id', 'school', 'first_name', 'last_name', 'second_name'],
                transaction
            });

            // Формируем список для рассадки
            const itemsToAssign = [];

            // Добавляем команды
            for (const team of teams) {
                if (team.Members && team.Members.length > 0) {
                    // Определяем школу команды (берем школу лидера или первую попавшуюся)
                    const leader = team.Members.find(m => m.isLead === true) || team.Members[0];
                    const school = leader ? leader.school : 'Неизвестно';
                    const memberCount = team.Members.length;

                    itemsToAssign.push({
                        type: 'team',
                        id: team.id,
                        name: team.name,
                        school: school,
                        memberCount: memberCount,
                        members: team.Members
                    });
                }
            }

            // Добавляем индивидуальных участников
            for (const participant of individualParticipants) {
                itemsToAssign.push({
                    type: 'individual',
                    id: participant.id,
                    name: `${participant.last_name} ${participant.first_name} ${participant.second_name || ''}`.trim(),
                    school: participant.school,
                    memberCount: 1,
                    members: [participant]
                });
            }

            // Сортируем по количеству участников (сначала большие команды)
            itemsToAssign.sort((a, b) => b.memberCount - a.memberCount);

            // Распределяем по аудиториям
            const assignments = [];
            const roomOccupancy = {}; // roomId -> { occupied: number, schools: Set }
            const roomAssignments = {}; // roomId -> [assignments]

            // Инициализируем структуры для каждой аудитории
            for (const room of rooms) {
                roomOccupancy[room.id] = { occupied: 0, schools: new Set() };
                roomAssignments[room.id] = [];
            }

            // Распределяем каждый элемент с равномерным заполнением
            for (const item of itemsToAssign) {
                let assigned = false;

                // Сначала ищем аудитории без команды из той же школы
                let suitableRooms = rooms
                    .map(room => ({
                        room,
                        occupancy: roomOccupancy[room.id]
                    }))
                    .filter(({ room, occupancy }) => {
                        const hasSpace = (occupancy.occupied + 1) <= room.capacity;
                        const schoolNotPresent = !occupancy.schools.has(item.school);
                        return hasSpace && schoolNotPresent;
                    })
                    .sort((a, b) => {
                        // Сортируем по проценту заполнения (сначала менее заполненные)
                        // Это обеспечит приоритет большим аудиториям
                        const fillRatioA = a.occupancy.occupied / a.room.capacity;
                        const fillRatioB = b.occupancy.occupied / b.room.capacity;
                        
                        if (Math.abs(fillRatioA - fillRatioB) > 0.001) {
                            return fillRatioA - fillRatioB;
                        }
                        
                        // Если процент заполнения одинаковый, приоритет большим аудиториям
                        if (a.room.capacity !== b.room.capacity) {
                            return b.room.capacity - a.room.capacity;
                        }
                        
                        // Если вместимость одинаковая, сортируем по номеру аудитории
                        return a.room.number.localeCompare(b.room.number);
                    });

                // Если не нашли аудиторию без команды из той же школы, ищем любую с местом
                if (suitableRooms.length === 0) {
                    suitableRooms = rooms
                        .map(room => ({
                            room,
                            occupancy: roomOccupancy[room.id]
                        }))
                        .filter(({ room, occupancy }) => {
                            const hasSpace = (occupancy.occupied + 1) <= room.capacity;
                            return hasSpace;
                        })
                        .sort((a, b) => {
                            // Сортируем по проценту заполнения (сначала менее заполненные)
                            // Это обеспечит приоритет большим аудиториям
                            const fillRatioA = a.occupancy.occupied / a.room.capacity;
                            const fillRatioB = b.occupancy.occupied / b.room.capacity;
                            
                            if (Math.abs(fillRatioA - fillRatioB) > 0.001) {
                                return fillRatioA - fillRatioB;
                            }
                            
                            // Если процент заполнения одинаковый, приоритет большим аудиториям
                            if (a.room.capacity !== b.room.capacity) {
                                return b.room.capacity - a.room.capacity;
                            }
                            
                            // Если вместимость одинаковая, сортируем по номеру аудитории
                            return a.room.number.localeCompare(b.room.number);
                        });
                }

                if (suitableRooms.length > 0) {
                    // Выбираем аудиторию с наименьшей занятостью
                    const { room, occupancy } = suitableRooms[0];

                    // Нашли подходящую аудиторию
                    if (item.type === 'team') {
                        await SeatingAssignmentModel.create({
                            teamId: item.id,
                            roomId: room.id,
                            userId: null
                        }, { transaction });
                    } else {
                        await SeatingAssignmentModel.create({
                            teamId: null,
                            roomId: room.id,
                            userId: item.id
                        }, { transaction });
                    }

                    // Каждая команда/участник занимает 1 место
                    occupancy.occupied += 1;
                    occupancy.schools.add(item.school);
                    roomAssignments[room.id].push(item);

                    assignments.push({
                        ...item,
                        roomId: room.id,
                        roomNumber: room.number
                    });

                    assigned = true;
                }

                if (!assigned) {
                    // Не удалось разместить - не хватает мест
                    console.warn(`Не удалось разместить: ${item.name} (${item.school}) - нет свободных мест`);
                }
            }

            await transaction.commit();

            return {
                success: true,
                totalItems: itemsToAssign.length,
                assignedItems: assignments.length,
                assignments: assignments
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Получить текущую рассадку (все аудитории, включая пустые)
     */
    async getSeating() {
        // Получаем все аудитории
        const allRooms = await RoomModel.findAll({
            order: [['number', 'ASC']]
        });

        // Получаем все назначения
        const assignments = await SeatingAssignmentModel.findAll({
            include: [
                {
                    model: TeamModel,
                    as: 'Team',
                    include: [{
                        model: UserModel,
                        as: 'Members',
                        attributes: ['id', 'school', 'first_name', 'last_name', 'second_name', 'isLead'],
                        where: { role: 'participant' },
                        required: false
                    }]
                },
                {
                    model: UserModel,
                    as: 'User',
                    attributes: ['id', 'school', 'first_name', 'last_name', 'second_name']
                }
            ]
        });

        // Группируем назначения по аудиториям
        const assignmentsByRoom = {};
        for (const assignment of assignments) {
            const roomId = assignment.roomId;
            if (!assignmentsByRoom[roomId]) {
                assignmentsByRoom[roomId] = [];
            }
            assignmentsByRoom[roomId].push(assignment);
        }

        // Формируем результат для всех аудиторий
        const result = allRooms.map(room => {
            const roomAssignments = assignmentsByRoom[room.id] || [];
            const items = [];

            for (const assignment of roomAssignments) {
                let item = null;
                if (assignment.teamId && assignment.Team) {
                    const team = assignment.Team;
                    const members = team.Members || [];
                    const leader = members.find(m => m.isLead === true) || members[0];
                    const school = leader ? leader.school : 'Неизвестно';

                    // Ограничиваем поля members только необходимыми
                    const safeMembers = members.map(m => ({
                        id: m.id,
                        first_name: m.first_name,
                        last_name: m.last_name,
                        second_name: m.second_name,
                        school: m.school,
                        isLead: m.isLead
                    }));

                    item = {
                        type: 'team',
                        id: team.id,
                        name: team.name,
                        school: school,
                        memberCount: members.length,
                        members: safeMembers
                    };
                } else if (assignment.userId && assignment.User) {
                    const user = assignment.User;
                    // Ограничиваем поля только необходимыми
                    item = {
                        type: 'individual',
                        id: user.id,
                        name: `${user.last_name} ${user.first_name} ${user.second_name || ''}`.trim(),
                        school: user.school,
                        memberCount: 1,
                        members: [{
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            second_name: user.second_name,
                            school: user.school
                        }]
                    };
                }

                if (item) {
                    items.push(item);
                }
            }

            return {
                room: {
                    id: room.id,
                    number: room.number,
                    capacity: room.capacity
                },
                items: items
            };
        });

        return result;
    }

    /**
     * Очистить рассадку
     */
    async clearSeating() {
        await SeatingAssignmentModel.destroy({ where: {} });
        return { message: 'Рассадка успешно очищена' };
    }

    /**
     * Ручное назначение команды/участника в аудиторию
     */
    async assignItem(teamId, userId, roomId) {
        // Проверяем, что указан либо teamId, либо userId
        if (!teamId && !userId) {
            throw ApiError.BadRequest('Необходимо указать либо команду, либо участника');
        }

        if (teamId && userId) {
            throw ApiError.BadRequest('Нельзя указать одновременно команду и участника');
        }

        // Проверяем существование аудитории
        const room = await RoomModel.findByPk(roomId);
        if (!room) {
            throw ApiError.BadRequest('Аудитория не найдена');
        }

        // Получаем информацию о школе
        let school = null;

        if (teamId) {
            const team = await TeamModel.findByPk(teamId, {
                include: [{
                    model: UserModel,
                    as: 'Members',
                    attributes: ['id', 'school', 'isLead'],
                    where: { role: 'participant' }
                }]
            });

            if (!team) {
                throw ApiError.BadRequest('Команда не найдена');
            }

            if (!team.Members || team.Members.length === 0) {
                throw ApiError.BadRequest('В команде нет участников');
            }

            const leader = team.Members.find(m => m.isLead === true) || team.Members[0];
            school = leader ? leader.school : 'Неизвестно';

            // Проверяем, не назначена ли уже команда
            const existing = await SeatingAssignmentModel.findOne({
                where: { teamId }
            });

            if (existing) {
                throw ApiError.BadRequest('Команда уже назначена в аудиторию');
            }
        } else {
            const user = await UserModel.findByPk(userId);
            if (!user) {
                throw ApiError.BadRequest('Участник не найден');
            }

            if (user.role !== 'participant') {
                throw ApiError.BadRequest('Пользователь не является участником');
            }

            school = user.school;

            // Проверяем, не назначен ли уже участник
            const existing = await SeatingAssignmentModel.findOne({
                where: { userId, teamId: null }
            });

            if (existing) {
                throw ApiError.BadRequest('Участник уже назначен в аудиторию');
            }
        }

        // Проверяем, нет ли в аудитории команды из той же школы
        const roomAssignments = await SeatingAssignmentModel.findAll({
            where: { roomId },
            include: [
                {
                    model: TeamModel,
                    as: 'Team',
                    include: [{
                        model: UserModel,
                        as: 'Members',
                        attributes: ['id', 'school', 'isLead', 'first_name', 'last_name', 'second_name'],
                        where: { role: 'participant' },
                        required: false
                    }]
                },
                {
                    model: UserModel,
                    as: 'User',
                    attributes: ['id', 'school']
                }
            ]
        });

        // Проверяем занятость
        let currentOccupancy = 0;

        for (const assignment of roomAssignments) {
            if (assignment.teamId && assignment.Team && assignment.Team.Members) {
                // Каждая команда занимает 1 место
                currentOccupancy += 1;
            } else if (assignment.userId && assignment.User) {
                // Каждый индивидуальный участник занимает 1 место
                currentOccupancy += 1;
            }
        }

        // Проверяем, есть ли место (каждая команда/участник = 1 место)
        if (currentOccupancy + 1 > room.capacity) {
            throw ApiError.BadRequest('В аудитории недостаточно мест');
        }

        // Разрешаем добавлять участников из одной школы (предупреждение показывается на фронтенде)

        // Создаем назначение
        await SeatingAssignmentModel.create({
            teamId: teamId || null,
            userId: userId || null,
            roomId: roomId
        });

        return { message: 'Назначение успешно создано' };
    }

    /**
     * Получить список нерассаженных команд и участников
     */
    async getUnassignedItems() {
        // Получаем все назначения
        const assignments = await SeatingAssignmentModel.findAll({
            attributes: ['teamId', 'userId']
        });

        const assignedTeamIds = new Set();
        const assignedUserIds = new Set();

        assignments.forEach(assignment => {
            if (assignment.teamId) {
                assignedTeamIds.add(assignment.teamId);
            }
            if (assignment.userId) {
                assignedUserIds.add(assignment.userId);
            }
        });

        // Получаем все команды с участниками
        const allTeams = await TeamModel.findAll({
            include: [{
                model: UserModel,
                as: 'Members',
                attributes: ['id', 'school', 'first_name', 'last_name', 'second_name', 'isLead'],
                where: { role: 'participant' }
            }]
        });

        // Получаем всех индивидуальных участников
        const allIndividualParticipants = await UserModel.findAll({
            where: {
                role: 'participant',
                teamId: null,
                participation_format: 'individual'
            },
            attributes: ['id', 'school', 'first_name', 'last_name', 'second_name']
        });

        // Фильтруем нерассаженные команды
        const unassignedTeams = [];
        for (const team of allTeams) {
            if (team.Members && team.Members.length > 0 && !assignedTeamIds.has(team.id)) {
                const leader = team.Members.find(m => m.isLead === true) || team.Members[0];
                const school = leader ? leader.school : 'Неизвестно';

                unassignedTeams.push({
                    type: 'team',
                    id: team.id,
                    name: team.name,
                    school: school,
                    memberCount: team.Members.length,
                    members: team.Members
                });
            }
        }

        // Фильтруем нерассаженных индивидуальных участников
        const unassignedIndividuals = allIndividualParticipants
            .filter(user => !assignedUserIds.has(user.id))
            .map(user => ({
                type: 'individual',
                id: user.id,
                name: `${user.last_name} ${user.first_name} ${user.second_name || ''}`.trim(),
                school: user.school,
                memberCount: 1,
                members: [user]
            }));

        return {
            teams: unassignedTeams,
            individuals: unassignedIndividuals,
            total: unassignedTeams.length + unassignedIndividuals.length
        };
    }

    /**
     * Добавить нерассаженных участников в существующую рассадку
     */
    async addUnassignedToSeating() {
        const transaction = await require('../db').transaction();

        try {
            // Получаем все аудитории
            const rooms = await RoomModel.findAll({
                order: [['number', 'ASC']],
                transaction
            });

            if (rooms.length === 0) {
                throw ApiError.BadRequest('Нет доступных аудиторий. Сначала добавьте аудитории.');
            }

            // Получаем нерассаженных
            const unassigned = await this.getUnassignedItems();
            
            if (unassigned.total === 0) {
                return {
                    success: true,
                    message: 'Все участники уже рассажены',
                    assignedItems: 0,
                    totalItems: 0
                };
            }

            // Загружаем текущие назначения для расчета занятости
            const existingAssignments = await SeatingAssignmentModel.findAll({
                include: [
                    {
                        model: TeamModel,
                        as: 'Team',
                        include: [{
                            model: UserModel,
                            as: 'Members',
                            attributes: ['id', 'school', 'isLead'],
                            where: { role: 'participant' },
                            required: false
                        }]
                    },
                    {
                        model: UserModel,
                        as: 'User',
                        attributes: ['id', 'school']
                    },
                    {
                        model: RoomModel,
                        as: 'Room',
                        attributes: ['id', 'number', 'capacity']
                    }
                ],
                transaction
            });

            // Инициализируем структуры для каждой аудитории
            const roomOccupancy = {};
            for (const room of rooms) {
                roomOccupancy[room.id] = { occupied: 0, schools: new Set() };
            }

            // Подсчитываем текущую занятость
            for (const assignment of existingAssignments) {
                if (assignment.Room) {
                    const roomId = assignment.Room.id;
                    const occupancy = roomOccupancy[roomId];

                    if (assignment.teamId && assignment.Team && assignment.Team.Members) {
                        const team = assignment.Team;
                        const leader = team.Members.find(m => m.isLead === true) || team.Members[0];
                        if (leader && leader.school) {
                            occupancy.schools.add(leader.school);
                        }
                        occupancy.occupied += 1;
                    } else if (assignment.userId && assignment.User) {
                        occupancy.schools.add(assignment.User.school);
                        occupancy.occupied += 1;
                    }
                }
            }

            // Формируем список для рассадки
            const itemsToAssign = [...unassigned.teams, ...unassigned.individuals];
            
            // Сортируем по количеству участников (сначала большие команды)
            itemsToAssign.sort((a, b) => b.memberCount - a.memberCount);

            const assignments = [];
            const roomAssignments = {};

            // Распределяем каждый элемент с равномерным заполнением
            for (const item of itemsToAssign) {
                let assigned = false;

                // Сначала ищем аудитории без команды из той же школы
                let suitableRooms = rooms
                    .map(room => ({
                        room,
                        occupancy: roomOccupancy[room.id]
                    }))
                    .filter(({ room, occupancy }) => {
                        const hasSpace = (occupancy.occupied + 1) <= room.capacity;
                        const schoolNotPresent = !occupancy.schools.has(item.school);
                        return hasSpace && schoolNotPresent;
                    })
                    .sort((a, b) => {
                        if (a.occupancy.occupied !== b.occupancy.occupied) {
                            return a.occupancy.occupied - b.occupancy.occupied;
                        }
                        return a.room.number.localeCompare(b.room.number);
                    });

                // Если не нашли аудиторию без команды из той же школы, ищем любую с местом
                if (suitableRooms.length === 0) {
                    suitableRooms = rooms
                        .map(room => ({
                            room,
                            occupancy: roomOccupancy[room.id]
                        }))
                        .filter(({ room, occupancy }) => {
                            const hasSpace = (occupancy.occupied + 1) <= room.capacity;
                            return hasSpace;
                        })
                        .sort((a, b) => {
                            if (a.occupancy.occupied !== b.occupancy.occupied) {
                                return a.occupancy.occupied - b.occupancy.occupied;
                            }
                            return a.room.number.localeCompare(b.room.number);
                        });
                }

                if (suitableRooms.length > 0) {
                    const { room, occupancy } = suitableRooms[0];

                    if (item.type === 'team') {
                        await SeatingAssignmentModel.create({
                            teamId: item.id,
                            roomId: room.id,
                            userId: null
                        }, { transaction });
                    } else {
                        await SeatingAssignmentModel.create({
                            teamId: null,
                            roomId: room.id,
                            userId: item.id
                        }, { transaction });
                    }

                    occupancy.occupied += 1;
                    occupancy.schools.add(item.school);
                    if (!roomAssignments[room.id]) {
                        roomAssignments[room.id] = [];
                    }
                    roomAssignments[room.id].push(item);

                    assignments.push({
                        ...item,
                        roomId: room.id,
                        roomNumber: room.number
                    });

                    assigned = true;
                }

                if (!assigned) {
                    console.warn(`Не удалось разместить: ${item.name} (${item.school}) - нет свободных мест`);
                }
            }

            await transaction.commit();

            return {
                success: true,
                totalItems: itemsToAssign.length,
                assignedItems: assignments.length,
                assignments: assignments,
                message: `Добавлено в рассадку: ${assignments.length} из ${itemsToAssign.length}`
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Удалить назначение
     */
    async removeAssignment(teamId, userId) {
        if (!teamId && !userId) {
            throw ApiError.BadRequest('Необходимо указать либо команду, либо участника');
        }

        const where = {};
        if (teamId) {
            where.teamId = teamId;
        } else {
            where.userId = userId;
            where.teamId = null;
        }

        const deleted = await SeatingAssignmentModel.destroy({ where });

        if (deleted === 0) {
            throw ApiError.BadRequest('Назначение не найдено');
        }

        return { message: 'Назначение успешно удалено' };
    }
}

module.exports = new SeatingService();
