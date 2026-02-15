const attendanceService = require('../service/attendance-service');
const ApiError = require('../exceptions/api-error');

class AttendanceController {
    /**
     * Получить список всех участников с рассадкой
     */
    async getParticipantsWithSeating(req, res, next) {
        try {
            const data = await attendanceService.getParticipantsWithSeating();

            return res.json({
                success: true,
                data
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Отметить присутствие участника
     */
    async markAttendance(req, res, next) {
        try {
            const { userId, attendance } = req.body;

            if (!userId) {
                throw ApiError.BadRequest('Необходимо указать ID участника');
            }

            if (typeof attendance !== 'boolean') {
                throw ApiError.BadRequest('Необходимо указать статус присутствия (true/false)');
            }

            const markedBy = req.user?.id || null;
            const result = await attendanceService.markAttendance(userId, attendance, markedBy);

            return res.json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Массовая отметка присутствия
     */
    async markMultipleAttendance(req, res, next) {
        try {
            const { userIds, attendance } = req.body;

            if (typeof attendance !== 'boolean') {
                throw ApiError.BadRequest('Необходимо указать статус присутствия (true/false)');
            }

            const markedBy = req.user?.id || null;
            const result = await attendanceService.markMultipleAttendance(userIds, attendance, markedBy);

            return res.json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить статистику по присутствию
     */
    async getStatistics(req, res, next) {
        try {
            const stats = await attendanceService.getAttendanceStatistics();

            return res.json({
                success: true,
                data: stats
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Экспорт всех посадочных листов в Excel (каждый кабинет на отдельном листе)
     */
    async exportAllRoomsToPDF(req, res, next) {
        try {
            const ExcelJS = require('exceljs');

            // Получаем данные всех кабинетов
            const allRoomsData = await attendanceService.getParticipantsWithSeating();

            // Создаем книгу Excel
            const workbook = new ExcelJS.Workbook();

            // Обрабатываем каждый кабинет
            allRoomsData.rooms.forEach((roomData) => {
                // Фильтруем только присутствующих
                const presentParticipants = roomData.participants.filter(p => p.attendance);
                
                if (presentParticipants.length === 0) {
                    return; // Пропускаем кабинет без присутствующих
                }

                // Группируем участников по командам
                const teams = {};
                const individuals = [];

                presentParticipants.forEach(p => {
                    if (p.teamName) {
                        if (!teams[p.teamName]) {
                            teams[p.teamName] = [];
                        }
                        teams[p.teamName].push(p);
                    } else {
                        individuals.push(p);
                    }
                });

                // Создаем лист для кабинета
                const sheetName = `Кабинет ${roomData.room.number}`;
                const worksheet = workbook.addWorksheet(sheetName);

                // Настройка печати
                worksheet.pageSetup = {
                    paperSize: 9, // A4
                    orientation: 'portrait',
                    fitToPage: true,
                    fitToWidth: 1,
                    fitToHeight: 0,
                    margins: {
                        left: 0.5, right: 0.5,
                        top: 0.75, bottom: 0.75,
                        header: 0.3, footer: 0.3
                    }
                };

                let currentRow = 1;

                // Заголовок
                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                const titleCell = worksheet.getCell(`A${currentRow}`);
                titleCell.value = 'IT-ВыСотка';
                titleCell.font = { size: 20, bold: true };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                const subtitleCell = worksheet.getCell(`A${currentRow}`);
                subtitleCell.value = 'Посадочный лист';
                subtitleCell.font = { size: 16, bold: true };
                subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                const roomCell = worksheet.getCell(`A${currentRow}`);
                roomCell.value = `Кабинет ${roomData.room.number}`;
                roomCell.font = { size: 14, bold: true };
                roomCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                const countCell = worksheet.getCell(`A${currentRow}`);
                countCell.value = `Участников: ${presentParticipants.length}`;
                countCell.font = { size: 12 };
                countCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow += 2;

                // Настройка ширины колонок
                worksheet.columns = [
                    { width: 5 },   // №
                    { width: 30 },  // ФИО
                    { width: 40 },  // Школа
                    { width: 20 },  // Команда
                    { width: 15 }   // Подпись
                ];

                // Функция добавления заголовка таблицы
                const addTableHeader = (row) => {
                    const headerRow = worksheet.getRow(row);
                    headerRow.values = ['№', 'ФИО', 'Школа', 'Команда', 'Подпись'];
                    headerRow.font = { bold: true, size: 11 };
                    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
                    headerRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE7E6E6' }
                    };
                    headerRow.height = 25;
                    
                    // Границы
                    for (let col = 1; col <= 5; col++) {
                        headerRow.getCell(col).border = {
                            top: { style: 'medium' },
                            left: { style: 'thin' },
                            bottom: { style: 'medium' },
                            right: { style: 'thin' }
                        };
                    }
                };

                let participantNumber = 1;

                // Добавляем команды
                Object.keys(teams).sort().forEach((teamName) => {
                    // Заголовок команды
                    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                    const teamHeaderCell = worksheet.getCell(`A${currentRow}`);
                    teamHeaderCell.value = `Команда: ${teamName}`;
                    teamHeaderCell.font = { size: 12, bold: true, color: { argb: 'FF0066CC' } };
                    teamHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
                    teamHeaderCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE3F2FD' }
                    };
                    currentRow++;

                    // Заголовок таблицы
                    addTableHeader(currentRow);
                    currentRow++;

                    // Участники команды
                    teams[teamName].forEach((participant) => {
                        const row = worksheet.getRow(currentRow);
                        row.values = [
                            participantNumber++,
                            participant.fullName,
                            participant.school,
                            teamName,
                            ''
                        ];
                        row.height = 20;
                        row.alignment = { vertical: 'middle' };
                        
                        // Границы
                        for (let col = 1; col <= 5; col++) {
                            row.getCell(col).border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }
                        
                        currentRow++;
                    });

                    currentRow++; // Пустая строка между командами
                });

                // Добавляем индивидуальных участников
                if (individuals.length > 0) {
                    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                    const individualHeaderCell = worksheet.getCell(`A${currentRow}`);
                    individualHeaderCell.value = 'Индивидуальные участники';
                    individualHeaderCell.font = { size: 12, bold: true, color: { argb: 'FF0066CC' } };
                    individualHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
                    individualHeaderCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFF3E0' }
                    };
                    currentRow++;

                    // Заголовок таблицы
                    addTableHeader(currentRow);
                    currentRow++;

                    // Индивидуальные участники
                    individuals.forEach((participant) => {
                        const row = worksheet.getRow(currentRow);
                        row.values = [
                            participantNumber++,
                            participant.fullName,
                            participant.school,
                            '–',
                            ''
                        ];
                        row.height = 20;
                        row.alignment = { vertical: 'middle' };
                        
                        // Границы
                        for (let col = 1; col <= 5; col++) {
                            row.getCell(col).border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }
                        
                        currentRow++;
                    });
                }

                // Футер
                currentRow += 2;
                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
                const footerCell = worksheet.getCell(`A${currentRow}`);
                footerCell.value = `Дата: ${new Date().toLocaleDateString('ru-RU')}`;
                footerCell.font = { size: 10, italic: true };
                footerCell.alignment = { horizontal: 'left' };
            });

            // Генерируем имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            const filename = `Посадочные_листы_${date}.xlsx`;

            // Устанавливаем заголовки для скачивания
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

            // Отправляем файл
            await workbook.xlsx.write(res);
            res.end();
        } catch (e) {
            console.error('Ошибка экспорта в PDF:', e);
            next(ApiError.BadRequest('Ошибка при экспорте посадочных листов'));
        }
    }

    /**
     * Получить историю отметок для участника
     */
    async getAttendanceHistory(req, res, next) {
        try {
            const { userId } = req.params;

            if (!userId) {
                throw ApiError.BadRequest('Необходимо указать ID участника');
            }

            const history = await attendanceService.getAttendanceHistory(userId);

            return res.json({
                success: true,
                data: history
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить всю историю отметок (для админа)
     */
    async getAllAttendanceHistory(req, res, next) {
        try {
            const { limit = 100, offset = 0 } = req.query;

            const result = await attendanceService.getAllAttendanceHistory(limit, offset);

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Экспорт протоколов проверки в Excel (каждый кабинет на отдельном листе)
     * Для заполнения баллов за эссе и 3 задания
     */
    async exportVerificationProtocols(req, res, next) {
        try {
            const ExcelJS = require('exceljs');

            // Получаем данные всех кабинетов
            const allRoomsData = await attendanceService.getParticipantsWithSeating();

            // Создаем книгу Excel
            const workbook = new ExcelJS.Workbook();

            // Обрабатываем каждый кабинет
            allRoomsData.rooms.forEach((roomData) => {
                // Фильтруем только рассаженных и присутствующих
                const presentParticipants = roomData.participants.filter(p => p.attendance);
                
                if (presentParticipants.length === 0) {
                    return; // Пропускаем кабинет без присутствующих
                }

                // Группируем участников по командам
                const teams = {};
                const individuals = [];

                presentParticipants.forEach(p => {
                    if (p.teamName) {
                        if (!teams[p.teamName]) {
                            teams[p.teamName] = [];
                        }
                        teams[p.teamName].push(p);
                    } else {
                        individuals.push(p);
                    }
                });

                // Создаем лист для кабинета
                const sheetName = `Кабинет ${roomData.room.number}`;
                const worksheet = workbook.addWorksheet(sheetName);

                // Настройка печати - книжный формат A4
                worksheet.pageSetup = {
                    paperSize: 9, // A4
                    orientation: 'portrait',
                    fitToPage: true,
                    fitToWidth: 1,
                    fitToHeight: 0,
                    margins: {
                        left: 0.4, right: 0.4,
                        top: 0.5, bottom: 0.5,
                        header: 0.3, footer: 0.3
                    }
                };

                let currentRow = 1;

                // Заголовок
                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const titleCell = worksheet.getCell(`A${currentRow}`);
                titleCell.value = 'IT-ВыСотка';
                titleCell.font = { size: 18, bold: true };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const subtitleCell = worksheet.getCell(`A${currentRow}`);
                subtitleCell.value = 'Протокол проверки';
                subtitleCell.font = { size: 14, bold: true };
                subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const roomCell = worksheet.getCell(`A${currentRow}`);
                roomCell.value = `Кабинет ${roomData.room.number}`;
                roomCell.font = { size: 12, bold: true };
                roomCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow++;

                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const countCell = worksheet.getCell(`A${currentRow}`);
                countCell.value = `Участников: ${presentParticipants.length}`;
                countCell.font = { size: 10 };
                countCell.alignment = { horizontal: 'center', vertical: 'middle' };
                currentRow += 2;

                // Настройка ширины колонок для книжного формата
                worksheet.columns = [
                    { width: 4 },   // №
                    { width: 22 },  // ФИО/Команда
                    { width: 7 },   // Э (40)
                    { width: 7 },   // З1 (20)
                    { width: 7 },   // З2 (20)
                    { width: 7 },   // З3 (20)
                    { width: 9 },   // Итого (100)
                    { width: 21 }   // Школа
                ];

                // Функция добавления заголовка таблицы
                const addTableHeader = (row) => {
                    const headerRow = worksheet.getRow(row);
                    headerRow.values = ['№', 'ФИО/Команда', 'Э\n(40)', 'З1\n(20)', 'З2\n(20)', 'З3\n(20)', 'Итого\n(100)', 'Школа'];
                    headerRow.font = { bold: true, size: 9 };
                    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    headerRow.height = 30;
                    
                    // Границы
                    for (let col = 1; col <= 8; col++) {
                        headerRow.getCell(col).border = {
                            top: { style: 'medium' },
                            left: { style: 'thin' },
                            bottom: { style: 'medium' },
                            right: { style: 'thin' }
                        };
                    }
                };

                let participantNumber = 1;

                // Добавляем команды
                Object.keys(teams).sort().forEach((teamName) => {
                    // Заголовок команды
                    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                    const teamHeaderCell = worksheet.getCell(`A${currentRow}`);
                    teamHeaderCell.value = `Команда: ${teamName}`;
                    teamHeaderCell.font = { size: 10, bold: true };
                    teamHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
                    currentRow++;

                    // Заголовок таблицы
                    addTableHeader(currentRow);
                    currentRow++;

                    // Строка для команды (общие баллы)
                    const teamRow = worksheet.getRow(currentRow);
                    teamRow.values = [
                        participantNumber++,
                        teamName,
                        '', // Эссе
                        '', // Задание 1
                        '', // Задание 2
                        '', // Задание 3
                        '', // Итого
                        teams[teamName][0].school // Школа
                    ];
                    teamRow.height = 20;
                    teamRow.alignment = { vertical: 'middle', horizontal: 'center' };
                    teamRow.font = { bold: true, size: 9 };
                    
                    // Границы
                    for (let col = 1; col <= 8; col++) {
                        teamRow.getCell(col).border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                    
                    // Выравнивание
                    teamRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                    teamRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                    teamRow.getCell(8).alignment = { horizontal: 'left', vertical: 'middle' };
                    
                    currentRow++;

                    // Участники команды (для справки)
                    teams[teamName].forEach((participant) => {
                        const row = worksheet.getRow(currentRow);
                        row.values = [
                            '',
                            `  • ${participant.fullName}`,
                            '',
                            '',
                            '',
                            '',
                            '',
                            ''
                        ];
                        row.height = 15;
                        row.alignment = { vertical: 'middle' };
                        row.font = { size: 8, italic: true, color: { argb: 'FF666666' } };
                        
                        // Границы только для первых двух и последней колонки
                        for (let col = 1; col <= 2; col++) {
                            row.getCell(col).border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }
                        row.getCell(8).border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                        
                        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        
                        currentRow++;
                    });

                    currentRow++; // Пустая строка между командами
                });

                // Добавляем индивидуальных участников
                if (individuals.length > 0) {
                    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                    const individualHeaderCell = worksheet.getCell(`A${currentRow}`);
                    individualHeaderCell.value = 'Индивидуальные участники';
                    individualHeaderCell.font = { size: 10, bold: true };
                    individualHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
                    currentRow++;

                    // Заголовок таблицы
                    addTableHeader(currentRow);
                    currentRow++;

                    // Индивидуальные участники
                    individuals.forEach((participant) => {
                        const row = worksheet.getRow(currentRow);
                        row.values = [
                            participantNumber++,
                            participant.fullName,
                            '', // Эссе
                            '', // Задание 1
                            '', // Задание 2
                            '', // Задание 3
                            '', // Итого
                            participant.school
                        ];
                        row.height = 20;
                        row.alignment = { vertical: 'middle', horizontal: 'center' };
                        row.font = { size: 9 };
                        
                        // Границы
                        for (let col = 1; col <= 8; col++) {
                            row.getCell(col).border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }
                        
                        // Выравнивание
                        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        row.getCell(8).alignment = { horizontal: 'left', vertical: 'middle' };
                        
                        currentRow++;
                    });
                }

                // Футер
                currentRow += 2;
                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const footerCell = worksheet.getCell(`A${currentRow}`);
                footerCell.value = `Дата: ${new Date().toLocaleDateString('ru-RU')}`;
                footerCell.font = { size: 9, italic: true };
                footerCell.alignment = { horizontal: 'left' };
                
                currentRow += 2;
                worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
                const signatureCell = worksheet.getCell(`A${currentRow}`);
                signatureCell.value = 'Проверяющий: _________________________ Подпись: _____________';
                signatureCell.font = { size: 9 };
                signatureCell.alignment = { horizontal: 'left' };
            });

            // Генерируем имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            const filename = `Протоколы_проверки_${date}.xlsx`;

            // Устанавливаем заголовки для скачивания
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

            // Отправляем файл
            await workbook.xlsx.write(res);
            res.end();
        } catch (e) {
            console.error('Ошибка экспорта протоколов проверки:', e);
            next(ApiError.BadRequest('Ошибка при экспорте протоколов проверки'));
        }
    }
}

module.exports = new AttendanceController();

