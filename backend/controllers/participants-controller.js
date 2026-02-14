const UserModel = require('../models/user-model');
const TeamModel = require('../models/team-model');
const SettingsModel = require('../models/settings-model');
const mailService = require('../service/mail-service');
const ApiError = require('../exceptions/api-error');
const { Op } = require('sequelize');

class ParticipantsController {
    /**
     * Получить список всех участников с фильтрами и пагинацией
     */
    async getAll(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                region = '',
                grade = '',
                programming_language = '',
                hasTeam = '',
                participation_format = '',
                attendance = '',
                sortBy = 'id',
                sortOrder = 'ASC'
            } = req.query;

            const offset = (page - 1) * limit;

            // Строим условия фильтрации
            const where = {
                role: 'participant' // Показываем только участников, не админов
            };

            // Поиск по ФИО или email
            if (search) {
                where[Op.or] = [
                    { first_name: { [Op.iLike]: `%${search}%` } },
                    { last_name: { [Op.iLike]: `%${search}%` } },
                    { second_name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Фильтр по региону
            if (region) {
                where.region = region;
            }

            // Фильтр по классу
            if (grade) {
                where.grade = parseInt(grade);
            }

            // Фильтр по языку программирования
            if (programming_language) {
                where.programming_language = programming_language;
            }

            // Фильтр по наличию команды
            if (hasTeam === 'true') {
                where.teamId = { [Op.ne]: null };
            } else if (hasTeam === 'false') {
                where.teamId = null;
            }

            // Фильтр по формату участия
            if (participation_format) {
                where.participation_format = participation_format;
            }

            // Фильтр по присутствию
            if (attendance === 'true') {
                where.attendance = true;
            } else if (attendance === 'false') {
                where.attendance = false;
            }

            // Валидация сортировки
            const allowedSortFields = ['id', 'last_name', 'email', 'grade', 'region', 'createdAt', 'teamId'];
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

            // Сортировка: по teamId – сначала группируем по команде, внутри команды по фамилии
            const order = validSortBy === 'teamId'
                ? [['teamId', validSortOrder], ['last_name', 'ASC']]
                : [[validSortBy, validSortOrder]];

            // Получаем участников с командами
            // Ограничиваем только необходимыми полями для безопасности
            const { count, rows: participants } = await UserModel.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order,
                include: [{
                    model: TeamModel,
                    as: 'Team',
                    attributes: ['id', 'name']
                }],
                attributes: [
                    'id',
                    'first_name',
                    'last_name',
                    'second_name',
                    'email',
                    'phone',
                    'school',
                    'grade',
                    'region',
                    'city',
                    'programming_language',
                    'participation_format',
                    'teamId',
                    'isLead',
                    'isActivated',
                    'role',
                    'birthday',
                    'essayUrl',
                    'certificateId',
                    'place',
                    'attendance'
                    // Исключаем: password
                ]
            });

            return res.json({
                success: true,
                data: {
                    participants,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить статистику участников
     */
    async getStats(req, res, next) {
        try {
            const totalParticipants = await UserModel.count({
                where: { role: 'participant' }
            });

            const activatedParticipants = await UserModel.count({
                where: { role: 'participant', isActivated: true }
            });

            const participantsWithTeam = await UserModel.count({
                where: { 
                    role: 'participant',
                    teamId: { [Op.ne]: null }
                }
            });

            // Участники с командным форматом, но без команды
            const participantsWithoutTeam = await UserModel.count({
                where: { 
                    role: 'participant',
                    participation_format: 'team',
                    teamId: null
                }
            });

            const totalTeams = await TeamModel.count();

            // Статистика по регионам
            const byRegion = await UserModel.findAll({
                where: { role: 'participant' },
                attributes: [
                    'region',
                    [UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'count']
                ],
                group: ['region'],
                order: [[UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'DESC']],
                raw: true
            });

            // Статистика по классам
            const byGrade = await UserModel.findAll({
                where: { role: 'participant' },
                attributes: [
                    'grade',
                    [UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'count']
                ],
                group: ['grade'],
                order: [['grade', 'ASC']],
                raw: true
            });

            // Статистика по языкам программирования
            const byLanguage = await UserModel.findAll({
                where: { role: 'participant' },
                attributes: [
                    'programming_language',
                    [UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'count']
                ],
                group: ['programming_language'],
                order: [[UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'DESC']],
                raw: true
            });

            // Статистика по формату участия
            const byParticipationFormat = await UserModel.findAll({
                where: { role: 'participant' },
                attributes: [
                    'participation_format',
                    [UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'count']
                ],
                group: ['participation_format'],
                order: [[UserModel.sequelize.fn('COUNT', UserModel.sequelize.col('id')), 'DESC']],
                raw: true
            });

            return res.json({
                success: true,
                data: {
                    total: totalParticipants,
                    activated: activatedParticipants,
                    withTeam: participantsWithTeam,
                    withoutTeam: participantsWithoutTeam,
                    totalTeams,
                    byRegion,
                    byGrade,
                    byLanguage,
                    byParticipationFormat
                }
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить детальную информацию об участнике
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const participant = await UserModel.findOne({
                where: { id, role: 'participant' },
                include: [{
                    model: TeamModel,
                    as: 'Team',
                    include: [{
                        model: UserModel,
                        as: 'Members',
                        attributes: ['id', 'first_name', 'last_name', 'second_name', 'email', 'grade', 'programming_language', 'isLead', 'school', 'essayUrl']
                    }]
                }],
                attributes: [
                    'id',
                    'first_name',
                    'last_name',
                    'second_name',
                    'email',
                    'phone',
                    'school',
                    'grade',
                    'region',
                    'city',
                    'programming_language',
                    'participation_format',
                    'teamId',
                    'isLead',
                    'isActivated',
                    'role',
                    'birthday',
                    'essayUrl'
                    // Исключаем: password
                ]
            });

            if (!participant) {
                return next(ApiError.BadRequest('Участник не найден'));
            }

            return res.json({
                success: true,
                data: participant
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Экспорт участников в Excel
     * Требует установки: npm install exceljs
     */
    async exportToExcel(req, res, next) {
        try {
            const ExcelJS = require('exceljs');

            // Получаем всех участников
            const participants = await UserModel.findAll({
                where: { role: 'participant' },
                include: [{
                    model: TeamModel,
                    as: 'Team',
                    attributes: ['name']
                }],
                order: [['last_name', 'ASC']],
                attributes: { exclude: ['password'] }
            });

            // Создаем книгу Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Участники');

            // Заголовки столбцов
            worksheet.columns = [
                { header: '№', key: 'number', width: 5 },
                { header: 'Фамилия', key: 'lastName', width: 20 },
                { header: 'Имя', key: 'firstName', width: 20 },
                { header: 'Отчество', key: 'secondName', width: 20 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Телефон', key: 'phone', width: 18 },
                { header: 'Дата рождения', key: 'birthday', width: 15 },
                { header: 'Регион', key: 'region', width: 30 },
                { header: 'Город', key: 'city', width: 25 },
                { header: 'Школа', key: 'school', width: 50 },
                { header: 'Класс', key: 'grade', width: 8 },
                { header: 'Язык программирования', key: 'language', width: 25 },
                { header: 'Формат участия', key: 'participationFormat', width: 20 },
                { header: 'Команда', key: 'team', width: 30 },
                { header: 'Лидер команды', key: 'isLead', width: 15 },
                { header: 'Активирован', key: 'isActivated', width: 15 }
            ];

            // Стилизация заголовков
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            // Заполняем данными
            participants.forEach((participant, index) => {
                worksheet.addRow({
                    number: index + 1,
                    lastName: participant.last_name,
                    firstName: participant.first_name,
                    secondName: participant.second_name || '',
                    email: participant.email,
                    phone: participant.phone,
                    birthday: participant.birthday,
                    region: participant.region,
                    city: participant.city,
                    school: participant.school,
                    grade: participant.grade,
                    language: participant.programming_language,
                    participationFormat: participant.participation_format === 'individual' ? 'Индивидуальное' : 'Командное',
                    team: participant.Team ? participant.Team.name : 'Без команды',
                    isLead: participant.isLead ? 'Да' : 'Нет',
                    isActivated: participant.isActivated ? 'Да' : 'Нет'
                });
            });

            // Автофильтр для всех колонок
            worksheet.autoFilter = {
                from: 'A1',
                to: 'P1'
            };

            // Генерируем имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            const filename = `Участники_IT-Высотка_${date}.xlsx`;

            // Устанавливаем заголовки для скачивания
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

            // Отправляем файл
            await workbook.xlsx.write(res);
            res.end();
        } catch (e) {
            console.error('Ошибка экспорта в Excel:', e);
            next(ApiError.BadRequest('Ошибка при экспорте данных'));
        }
    }

    /**
     * Удалить участника (только если не состоит в команде)
     */
    async deleteParticipant(req, res, next) {
        try {
            const { id } = req.params;

            const participant = await UserModel.findOne({
                where: { id, role: 'participant' },
                include: [{
                    model: TeamModel,
                    as: 'Team',
                    attributes: ['name']
                }]
            });

            if (!participant) {
                return next(ApiError.BadRequest('Участник не найден'));
            }

            // Проверяем, не состоит ли в команде
            if (participant.teamId) {
                const teamName = participant.Team ? participant.Team.name : 'неизвестной команде';
                
                if (participant.isLead) {
                    return next(ApiError.BadRequest(
                        `Невозможно удалить лидера команды "${teamName}". Сначала необходимо удалить команду или передать лидерство другому участнику.`
                    ));
                } else {
                    return next(ApiError.BadRequest(
                        `Невозможно удалить участника команды "${teamName}". Сначала исключите его из команды.`
                    ));
                }
            }

            await participant.destroy();

            return res.json({
                success: true,
                message: 'Участник успешно удален'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Обновить место участника
     */
    async updatePlace(req, res, next) {
        try {
            const { id } = req.params;
            const { place } = req.body;

            const participant = await UserModel.findOne({
                where: { id, role: 'participant' }
            });

            if (!participant) {
                return next(ApiError.BadRequest('Участник не найден'));
            }

            // Валидация места (может быть null, 1, 2 или 3)
            if (place !== null && place !== '' && (isNaN(place) || place < 1 || place > 3)) {
                return next(ApiError.BadRequest('Место должно быть 1, 2, 3 или пусто'));
            }

            // Если place пустое или null, устанавливаем null
            const validPlace = (place === null || place === '') ? null : parseInt(place);

            await participant.update({ place: validPlace });

            return res.json({
                success: true,
                message: validPlace ? `Место ${validPlace} успешно назначено` : 'Место успешно снято',
                data: {
                    id: participant.id,
                    place: participant.place
                }
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Отправить письма-напоминания об эссе всем участникам без прикрепленного эссе
     * (индивидуальные участники и лидеры команд)
     */
    async sendEssayReminders(req, res, next) {
        try {
            // Получаем дату закрытия эссе (если задана)
            const essaySetting = await SettingsModel.findOne({
                where: { key: 'essay_close_date' }
            });

            let essayDeadlineText = null;
            if (essaySetting && essaySetting.value) {
                const deadline = new Date(essaySetting.value);
                if (!isNaN(deadline.getTime())) {
                    const day = String(deadline.getDate()).padStart(2, '0');
                    const month = String(deadline.getMonth() + 1).padStart(2, '0');
                    const year = deadline.getFullYear();
                    const hours = String(deadline.getHours()).padStart(2, '0');
                    const minutes = String(deadline.getMinutes()).padStart(2, '0');
                    essayDeadlineText = `${day}.${month}.${year} ${hours}:${minutes} (по местному времени)`;
                }
            }

            // Ищем участников без эссе
            const participants = await UserModel.findAll({
                where: {
                    role: 'participant',
                    isActivated: true,
                    [Op.or]: [
                        { essayUrl: null },
                        { essayUrl: '' }
                    ],
                    [Op.or]: [
                        { participation_format: 'individual' },
                        {
                            participation_format: 'team',
                            isLead: true
                        }
                    ]
                },
                attributes: ['id', 'email', 'participation_format', 'isLead']
            });

            if (!participants.length) {
                return res.json({
                    success: true,
                    message: 'Нет участников без прикрепленного эссе, письма не отправлены',
                    data: { sent: 0 }
                });
            }

            const profileLink = `${process.env.URL}/profile`;
            let sentCount = 0;
            const errors = [];

            for (const participant of participants) {
                if (!participant.email) {
                    errors.push(`Пользователь ID ${participant.id} не имеет email, письмо не отправлено`);
                    continue;
                }

                try {
                    await mailService.sendEssayReminderMail(
                        participant.email,
                        essayDeadlineText,
                        profileLink
                    );
                    sentCount += 1;
                } catch (err) {
                    console.error('Ошибка отправки письма-напоминания об эссе:', err);
                    errors.push(`Не удалось отправить письмо на ${participant.email}`);
                }
            }

            return res.json({
                success: true,
                message: `Письма-напоминания отправлены ${sentCount} участникам`,
                data: {
                    sent: sentCount,
                    totalCandidates: participants.length,
                    errors
                }
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Отправить письма участникам с командным форматом, которые не состоят в команде
     */
    async sendTeamFormatWithoutTeamReminders(req, res, next) {
        try {
            const participants = await UserModel.findAll({
                where: {
                    role: 'participant',
                    isActivated: true,
                    participation_format: 'team',
                    teamId: null
                },
                attributes: ['id', 'email']
            });

            if (!participants.length) {
                return res.json({
                    success: true,
                    message: 'Нет участников с командным форматом без команды, письма не отправлены',
                    data: { sent: 0 }
                });
            }

            const profileLink = `${process.env.URL}/profile`;
            let sentCount = 0;
            const errors = [];

            for (const participant of participants) {
                if (!participant.email) {
                    errors.push(`Пользователь ID ${participant.id} не имеет email, письмо не отправлено`);
                    continue;
                }

                try {
                    await mailService.sendTeamWithoutTeamReminderMail(
                        participant.email,
                        profileLink
                    );
                    sentCount += 1;
                } catch (err) {
                    console.error('Ошибка отправки письма участнику без команды:', err);
                    errors.push(`Не удалось отправить письмо на ${participant.email}`);
                }
            }

            return res.json({
                success: true,
                message: `Письма участникам с командным форматом без команды отправлены ${sentCount} участникам`,
                data: {
                    sent: sentCount,
                    totalCandidates: participants.length,
                    errors
                }
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ParticipantsController();