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
                        // Сортируем по занятости (сначала менее заполненные)
                        // Если занятость одинаковая, сортируем по номеру аудитории
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
                            // Сортируем по занятости (сначала менее заполненные)
                            // Если занятость одинаковая, сортируем по номеру аудитории
                            if (a.occupancy.occupied !== b.occupancy.occupied) {
                                return a.occupancy.occupied - b.occupancy.occupied;
                            }
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
     * Получить текущую рассадку
     */
    async getSeating() {
        const assignments = await SeatingAssignmentModel.findAll({
            include: [
                {
                    model: RoomModel,
                    as: 'Room',
                    attributes: ['id', 'number', 'capacity']
                },
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
            ],
            order: [
                [{ model: RoomModel, as: 'Room' }, 'number', 'ASC']
            ]
        });

        // Группируем по аудиториям
        const seatingByRoom = {};
        const roomStats = {};

        for (const assignment of assignments) {
            const roomId = assignment.roomId;
            const room = assignment.Room;

            if (!room) {
                console.warn(`Assignment ${assignment.id} has no room`);
                continue;
            }

            if (!seatingByRoom[roomId]) {
                seatingByRoom[roomId] = {
                    room: {
                        id: room.id,
                        number: room.number,
                        capacity: room.capacity
                    },
                    items: []
                };
                roomStats[roomId] = {
                    occupied: 0,
                    schools: new Set()
                };
            }

            let item = null;
            if (assignment.teamId && assignment.Team) {
                const team = assignment.Team;
                const members = team.Members || [];
                const leader = members.find(m => m.isLead === true) || members[0];
                const school = leader ? leader.school : 'Неизвестно';

                item = {
                    type: 'team',
                    id: team.id,
                    name: team.name,
                    school: school,
                    memberCount: members.length,
                    members: members
                };
            } else if (assignment.userId && assignment.User) {
                const user = assignment.User;
                item = {
                    type: 'individual',
                    id: user.id,
                    name: `${user.last_name} ${user.first_name} ${user.second_name || ''}`.trim(),
                    school: user.school,
                    memberCount: 1,
                    members: [user]
                };
            }

            if (item) {
                seatingByRoom[roomId].items.push(item);
                // Каждая команда или индивидуальный участник занимает 1 место
                roomStats[roomId].occupied += 1;
                roomStats[roomId].schools.add(item.school);
            }
        }

        // Преобразуем в массив и добавляем статистику
        const result = Object.values(seatingByRoom).map(roomData => ({
            ...roomData,
            stats: {
                occupied: roomStats[roomData.room.id].occupied,
                free: roomData.room.capacity - roomStats[roomData.room.id].occupied,
                schoolsCount: roomStats[roomData.room.id].schools.size,
                schools: Array.from(roomStats[roomData.room.id].schools)
            }
        }));

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
                    attributes: ['id', 'school']
                }
            ]
        });

        // Проверяем занятость и школы
        let currentOccupancy = 0;
        const schoolsInRoom = new Set();

        for (const assignment of roomAssignments) {
                if (assignment.teamId && assignment.Team && assignment.Team.Members) {
                const team = assignment.Team;
                const leader = team.Members.find(m => m.isLead === true) || team.Members[0];
                if (leader && leader.school) {
                    schoolsInRoom.add(leader.school);
                }
                // Каждая команда занимает 1 место
                currentOccupancy += 1;
            } else if (assignment.userId && assignment.User) {
                schoolsInRoom.add(assignment.User.school);
                // Каждый индивидуальный участник занимает 1 место
                currentOccupancy += 1;
            }
        }

        // Проверяем, есть ли место (каждая команда/участник = 1 место)
        if (currentOccupancy + 1 > room.capacity) {
            throw ApiError.BadRequest(`В аудитории недостаточно мест. Свободно: ${room.capacity - currentOccupancy}, требуется: 1`);
        }

        // Проверяем, нет ли команды из той же школы
        if (schoolsInRoom.has(school)) {
            throw ApiError.BadRequest(`В этой аудитории уже есть команда/участник из школы "${school}"`);
        }

        // Создаем назначение
        await SeatingAssignmentModel.create({
            teamId: teamId || null,
            userId: userId || null,
            roomId: roomId
        });

        return { message: 'Назначение успешно создано' };
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
