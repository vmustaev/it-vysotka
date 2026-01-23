const seatingService = require('../service/seating-service');
const ApiError = require('../exceptions/api-error');

class SeatingController {
    /**
     * Автоматическая рассадка
     */
    async autoAssign(req, res, next) {
        try {
            const result = await seatingService.autoAssignSeating();

            return res.json({
                success: true,
                data: result,
                message: `Рассадка выполнена: размещено ${result.assignedItems} из ${result.totalItems}`
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить текущую рассадку
     */
    async getSeating(req, res, next) {
        try {
            const seating = await seatingService.getSeating();

            return res.json({
                success: true,
                data: seating
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Очистить рассадку
     */
    async clearSeating(req, res, next) {
        try {
            const result = await seatingService.clearSeating();

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Ручное назначение команды/участника в аудиторию
     */
    async assignItem(req, res, next) {
        try {
            const { teamId, userId, roomId } = req.body;

            const result = await seatingService.assignItem(teamId, userId, roomId);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить список нерассаженных команд и участников
     */
    async getUnassigned(req, res, next) {
        try {
            const unassigned = await seatingService.getUnassignedItems();

            return res.json({
                success: true,
                data: unassigned
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Добавить нерассаженных участников в существующую рассадку
     */
    async addUnassigned(req, res, next) {
        try {
            const result = await seatingService.addUnassignedToSeating();

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
     * Удалить назначение
     */
    async removeAssignment(req, res, next) {
        try {
            const { teamId, userId } = req.body;

            const result = await seatingService.removeAssignment(teamId, userId);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Экспорт рассадки в Excel (каждый кабинет на отдельном листе)
     */
    async exportToExcel(req, res, next) {
        try {
            const ExcelJS = require('exceljs');

            // Получаем данные рассадки
            const seating = await seatingService.getSeating();

            // Создаем книгу Excel
            const workbook = new ExcelJS.Workbook();

            // Обрабатываем каждый кабинет
            for (const roomData of seating) {
                const { room, items } = roomData;
                
                // Создаем имя листа (ограничиваем до 31 символа для Excel)
                let sheetName = `Кабинет ${room.number}`;
                if (sheetName.length > 31) {
                    sheetName = sheetName.substring(0, 31);
                }

                // Создаем лист для кабинета
                const worksheet = workbook.addWorksheet(sheetName);

                // Настраиваем ширину столбцов
                worksheet.columns = [
                    { width: 5 },   // №
                    { width: 30 },  // Формат участия/Название команды
                    { width: 20 },  // Фамилия
                    { width: 20 },  // Имя
                    { width: 20 },  // Отчество
                    { width: 15 },  // Дата рождения
                    { width: 50 }   // Школа
                ];

                // Добавляем заголовки столбцов
                const headerRow = worksheet.getRow(1);
                headerRow.values = ['№', 'Формат участия/Название команды', 'Фамилия', 'Имя', 'Отчество', 'Дата рождения', 'Школа'];
                headerRow.font = { bold: true };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7E6E6' }
                };
                headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

                // Заполняем данными
                let rowNumber = 0;
                items.forEach((item) => {
                    if (item.type === 'team') {
                        // Для команд: создаем отдельную строку для каждого участника
                        item.members.forEach((member) => {
                            rowNumber++;
                            // Форматируем дату рождения
                            let birthday = '';
                            if (member.birthday) {
                                const date = new Date(member.birthday);
                                if (!isNaN(date.getTime())) {
                                    birthday = date.toISOString().split('T')[0];
                                }
                            }
                            
                            worksheet.addRow([
                                rowNumber, // №
                                item.name, // Название команды
                                member.last_name || '', // Фамилия
                                member.first_name || '', // Имя
                                member.second_name || '', // Отчество
                                birthday, // Дата рождения
                                item.school // Школа
                            ]);
                        });
                    } else {
                        // Для индивидуальных участников: одна строка
                        const member = item.members[0];
                        if (member) {
                            rowNumber++;
                            // Форматируем дату рождения
                            let birthday = '';
                            if (member.birthday) {
                                const date = new Date(member.birthday);
                                if (!isNaN(date.getTime())) {
                                    birthday = date.toISOString().split('T')[0];
                                }
                            }
                            
                            worksheet.addRow([
                                rowNumber, // №
                                'Индивидуальное', // Формат участия
                                member.last_name || '', // Фамилия
                                member.first_name || '', // Имя
                                member.second_name || '', // Отчество
                                birthday, // Дата рождения
                                item.school // Школа
                            ]);
                        }
                    }
                });

                // Если кабинет пустой, добавляем сообщение
                if (items.length === 0) {
                    rowNumber++;
                    worksheet.addRow(['-', 'Кабинет пуст', '-', '-', '-', '-', '-']);
                }

                // Автофильтр для всех колонок
                if (rowNumber > 0) {
                    worksheet.autoFilter = {
                        from: 'A1',
                        to: `G${rowNumber + 1}` // +1 потому что заголовок на строке 1, теперь 7 колонок (G)
                    };
                }

                // Устанавливаем высоту строки заголовка
                worksheet.getRow(1).height = 20;
            }

            // Генерируем имя файла с датой
            const date = new Date().toISOString().split('T')[0];
            const filename = `Рассадка_IT-Высотка_${date}.xlsx`;

            // Устанавливаем заголовки для скачивания
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

            // Отправляем файл
            await workbook.xlsx.write(res);
            res.end();
        } catch (e) {
            console.error('Ошибка экспорта рассадки в Excel:', e);
            next(ApiError.BadRequest('Ошибка при экспорте рассадки'));
        }
    }
}

module.exports = new SeatingController();
