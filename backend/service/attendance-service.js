const SeatingAssignmentModel = require('../models/seating-assignment-model');
const RoomModel = require('../models/room-model');
const TeamModel = require('../models/team-model');
const UserModel = require('../models/user-model');
const AttendanceHistoryModel = require('../models/attendance-history-model');
const ApiError = require('../exceptions/api-error');

class AttendanceService {
    /**
     * Получить список всех участников с рассадкой для волонтера
     */
    async getParticipantsWithSeating() {
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
                        attributes: ['id', 'email', 'school', 'first_name', 'last_name', 'second_name', 'isLead', 'attendance', 'phone', 'birthday', 'region', 'city', 'programming_language', 'grade'],
                        where: { role: 'participant' },
                        required: false
                    }]
                },
                {
                    model: UserModel,
                    as: 'User',
                    attributes: ['id', 'email', 'school', 'first_name', 'last_name', 'second_name', 'attendance', 'phone', 'birthday', 'region', 'city', 'programming_language', 'grade']
                },
                {
                    model: RoomModel,
                    as: 'Room',
                    attributes: ['id', 'number', 'capacity']
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
            const participants = [];

            for (const assignment of roomAssignments) {
                if (assignment.teamId && assignment.Team) {
                    const team = assignment.Team;
                    const members = team.Members || [];

                    // Добавляем каждого участника команды
                    members.forEach(member => {
                        participants.push({
                            id: member.id,
                            firstName: member.first_name,
                            lastName: member.last_name,
                            secondName: member.second_name,
                            fullName: `${member.last_name} ${member.first_name} ${member.second_name || ''}`.trim(),
                            email: member.email,
                            school: member.school,
                            teamName: team.name,
                            isTeamMember: true,
                            attendance: member.attendance || false,
                            phone: member.phone,
                            birthday: member.birthday,
                            region: member.region,
                            city: member.city,
                            programming_language: member.programming_language,
                            grade: member.grade
                        });
                    });
                } else if (assignment.userId && assignment.User) {
                    const user = assignment.User;
                    participants.push({
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        secondName: user.second_name,
                        fullName: `${user.last_name} ${user.first_name} ${user.second_name || ''}`.trim(),
                        email: user.email,
                        school: user.school,
                        teamName: null,
                        isTeamMember: false,
                        attendance: user.attendance || false,
                        phone: user.phone,
                        birthday: user.birthday,
                        region: user.region,
                        city: user.city,
                        programming_language: user.programming_language,
                        grade: user.grade
                    });
                }
            }

            // Сортируем участников по фамилии
            participants.sort((a, b) => a.lastName.localeCompare(b.lastName));

            return {
                room: {
                    id: room.id,
                    number: room.number,
                    capacity: room.capacity
                },
                participants: participants,
                totalParticipants: participants.length,
                presentCount: participants.filter(p => p.attendance).length
            };
        });

        // Подсчитываем общую статистику
        const totalParticipants = result.reduce((sum, r) => sum + r.totalParticipants, 0);
        const totalPresent = result.reduce((sum, r) => sum + r.presentCount, 0);

        return {
            rooms: result,
            statistics: {
                totalParticipants,
                totalPresent,
                totalAbsent: totalParticipants - totalPresent
            }
        };
    }

    /**
     * Отметить присутствие участника
     */
    async markAttendance(userId, attendance, markedBy) {
        const user = await UserModel.findByPk(userId);

        if (!user) {
            throw ApiError.BadRequest('Участник не найден');
        }

        if (user.role !== 'participant') {
            throw ApiError.BadRequest('Пользователь не является участником');
        }

        // Проверяем, не изменился ли уже статус
        const previousAttendance = user.attendance;
        
        user.attendance = attendance;
        await user.save();

        // Сохраняем историю отметки
        if (markedBy) {
            await AttendanceHistoryModel.create({
                userId: user.id,
                markedBy: markedBy,
                attendance: attendance
            });
        }

        // Если статус уже был таким же, сообщаем об этом
        const wasAlreadySet = previousAttendance === attendance;

        return {
            success: true,
            message: wasAlreadySet 
                ? (attendance ? 'Участник уже отмечен как присутствующий' : 'Участник уже отмечен как отсутствующий')
                : (attendance ? 'Участник отмечен как присутствующий' : 'Отметка о присутствии снята'),
            userId: user.id,
            attendance: user.attendance,
            wasAlreadySet: wasAlreadySet
        };
    }

    /**
     * Массовая отметка присутствия для списка участников
     */
    async markMultipleAttendance(userIds, attendance, markedBy) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw ApiError.BadRequest('Необходимо указать список участников');
        }

        const users = await UserModel.findAll({
            where: {
                id: userIds,
                role: 'participant'
            }
        });

        if (users.length === 0) {
            throw ApiError.BadRequest('Участники не найдены');
        }

        // Обновляем всех участников
        await UserModel.update(
            { attendance },
            {
                where: {
                    id: userIds,
                    role: 'participant'
                }
            }
        );

        // Сохраняем историю для каждого участника
        if (markedBy) {
            const historyRecords = userIds.map(userId => ({
                userId: userId,
                markedBy: markedBy,
                attendance: attendance
            }));
            await AttendanceHistoryModel.bulkCreate(historyRecords);
        }

        return {
            success: true,
            message: `Обновлено записей: ${users.length}`,
            updatedCount: users.length,
            attendance
        };
    }

    /**
     * Получить статистику по присутствию
     */
    async getAttendanceStatistics() {
        const totalParticipants = await UserModel.count({
            where: { role: 'participant' }
        });

        const presentParticipants = await UserModel.count({
            where: { 
                role: 'participant',
                attendance: true
            }
        });

        return {
            totalParticipants,
            presentParticipants,
            absentParticipants: totalParticipants - presentParticipants,
            attendanceRate: totalParticipants > 0 
                ? ((presentParticipants / totalParticipants) * 100).toFixed(2) 
                : 0
        };
    }

    /**
     * Получить участников конкретной аудитории для экспорта
     */
    async getRoomParticipants(roomId) {
        const room = await RoomModel.findByPk(roomId);
        if (!room) {
            throw ApiError.BadRequest('Аудитория не найдена');
        }

        const assignments = await SeatingAssignmentModel.findAll({
            where: { roomId },
            include: [
                {
                    model: TeamModel,
                    as: 'Team',
                    include: [{
                        model: UserModel,
                        as: 'Members',
                        attributes: ['id', 'school', 'first_name', 'last_name', 'second_name', 'isLead', 'attendance'],
                        where: { role: 'participant' },
                        required: false
                    }]
                },
                {
                    model: UserModel,
                    as: 'User',
                    attributes: ['id', 'school', 'first_name', 'last_name', 'second_name', 'attendance']
                }
            ]
        });

        const participants = [];

        for (const assignment of assignments) {
            if (assignment.teamId && assignment.Team) {
                const team = assignment.Team;
                const members = team.Members || [];

                members.forEach(member => {
                    participants.push({
                        firstName: member.first_name,
                        lastName: member.last_name,
                        secondName: member.second_name,
                        fullName: `${member.last_name} ${member.first_name} ${member.second_name || ''}`.trim(),
                        school: member.school,
                        teamName: team.name,
                        attendance: member.attendance || false
                    });
                });
            } else if (assignment.userId && assignment.User) {
                const user = assignment.User;
                participants.push({
                    firstName: user.first_name,
                    lastName: user.last_name,
                    secondName: user.second_name,
                    fullName: `${user.last_name} ${user.first_name} ${user.second_name || ''}`.trim(),
                    school: user.school,
                    teamName: null,
                    attendance: user.attendance || false
                });
            }
        }

        // Сортируем по фамилии
        participants.sort((a, b) => a.lastName.localeCompare(b.lastName));

        return {
            room: {
                number: room.number,
                capacity: room.capacity
            },
            participants,
            totalParticipants: participants.length,
            presentCount: participants.filter(p => p.attendance).length
        };
    }

    /**
     * Получить историю отметок для участника
     */
    async getAttendanceHistory(userId) {
        if (!userId) {
            throw ApiError.BadRequest('Необходимо указать ID участника');
        }

        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw ApiError.BadRequest('Участник не найден');
        }

        const history = await AttendanceHistoryModel.findAll({
            where: { userId },
            include: [{
                model: UserModel,
                as: 'MarkedByUser',
                attributes: ['id', 'first_name', 'last_name', 'second_name', 'role'],
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        return history.map(record => ({
            id: record.id,
            attendance: record.attendance,
            createdAt: record.createdAt,
            markedBy: record.MarkedByUser ? {
                id: record.MarkedByUser.id,
                name: `${record.MarkedByUser.last_name} ${record.MarkedByUser.first_name} ${record.MarkedByUser.second_name || ''}`.trim(),
                role: record.MarkedByUser.role
            } : null
        }));
    }

    /**
     * Получить всю историю отметок (для админа)
     */
    async getAllAttendanceHistory(limit = 100, offset = 0) {
        const { count, rows: history } = await AttendanceHistoryModel.findAndCountAll({
            include: [
                {
                    model: UserModel,
                    as: 'Participant',
                    attributes: ['id', 'first_name', 'last_name', 'second_name', 'school'],
                    required: false
                },
                {
                    model: UserModel,
                    as: 'MarkedByUser',
                    attributes: ['id', 'first_name', 'last_name', 'second_name', 'role'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            total: count,
            history: history.map(record => ({
                id: record.id,
                participant: record.Participant ? {
                    id: record.Participant.id,
                    name: `${record.Participant.last_name} ${record.Participant.first_name} ${record.Participant.second_name || ''}`.trim(),
                    school: record.Participant.school
                } : null,
                attendance: record.attendance,
                createdAt: record.createdAt,
                markedBy: record.MarkedByUser ? {
                    id: record.MarkedByUser.id,
                    name: `${record.MarkedByUser.last_name} ${record.MarkedByUser.first_name} ${record.MarkedByUser.second_name || ''}`.trim(),
                    role: record.MarkedByUser.role
                } : null
            }))
        };
    }
}

module.exports = new AttendanceService();

