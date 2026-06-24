const SettingsModel = require('../models/settings-model');
const ApiError = require('../exceptions/api-error');

class SettingsService {
    _parseDiplomasByYear(settingsObj) {
        let diplomasByYear = {};

        if (settingsObj.diplomas_by_year) {
            try {
                diplomasByYear = typeof settingsObj.diplomas_by_year === 'string'
                    ? JSON.parse(settingsObj.diplomas_by_year)
                    : settingsObj.diplomas_by_year;
            } catch (e) {
                diplomasByYear = {};
            }
        }

        if (settingsObj.diplomas_text && settingsObj.results_year) {
            const legacyYear = String(settingsObj.results_year);
            if (!diplomasByYear[legacyYear]) {
                diplomasByYear[legacyYear] = settingsObj.diplomas_text;
            }
        }

        return diplomasByYear;
    }

    /**
     * Получить все настройки
     */
    async getSettings() {
        const settings = await SettingsModel.findAll();
        const settingsObj = {};
        
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        // Устанавливаем значения по умолчанию, если их нет
        if (!settingsObj.registration_start) {
            settingsObj.registration_start = null;
        }
        if (!settingsObj.registration_end) {
            settingsObj.registration_end = null;
        }
        if (!settingsObj.championship_datetime) {
            settingsObj.championship_datetime = null;
        }
        if (!settingsObj.essay_close_date) {
            settingsObj.essay_close_date = null;
        }

        settingsObj.diplomas_by_year = this._parseDiplomasByYear(settingsObj);

        return settingsObj;
    }

    /**
     * Обновить настройки
     */
    async updateSettings(settingsData) {
        const { registration_start, registration_end, championship_datetime, essay_close_date, diplomas_by_year } = settingsData;

        // Валидация дат регистрации
        if (registration_start && registration_end) {
            if (registration_start >= registration_end) {
                throw ApiError.BadRequest('Дата начала регистрации должна быть раньше даты окончания');
            }
        }

        // Обновляем или создаем настройки
        if (registration_start !== undefined) {
            await SettingsModel.upsert({
                key: 'registration_start',
                value: registration_start || null
            });
        }

        if (registration_end !== undefined) {
            await SettingsModel.upsert({
                key: 'registration_end',
                value: registration_end || null
            });
        }

        if (championship_datetime !== undefined) {
            await SettingsModel.upsert({
                key: 'championship_datetime',
                value: championship_datetime || null
            });
        }

        if (essay_close_date !== undefined) {
            await SettingsModel.upsert({
                key: 'essay_close_date',
                value: essay_close_date || null
            });
        }

        if (diplomas_by_year !== undefined) {
            const cleaned = {};
            if (diplomas_by_year && typeof diplomas_by_year === 'object') {
                Object.entries(diplomas_by_year).forEach(([year, text]) => {
                    const normalizedYear = String(year).trim();
                    const normalizedText = text ? String(text).trim() : '';
                    if (normalizedYear && normalizedText) {
                        cleaned[normalizedYear] = normalizedText;
                    }
                });
            }

            await SettingsModel.upsert({
                key: 'diplomas_by_year',
                value: Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null
            });
        }

        return await this.getSettings();
    }

    /**
     * Проверить, открыта ли регистрация
     */
    async isRegistrationOpen() {
        const settings = await this.getSettings();
        
        const now = new Date();
        
        // Если даты не установлены, регистрация закрыта
        if (!settings.registration_start || !settings.registration_end) {
            return false;
        }

        // Проверяем дату начала
        const startDate = new Date(settings.registration_start);
        const nowUTC = Date.now();
        const startUTC = startDate.getTime();
        if (nowUTC < startUTC) {
            return false; // Регистрация еще не началась
        }

        // Проверяем дату окончания
        const endDate = new Date(settings.registration_end);
        const endUTC = endDate.getTime();
        
        if (nowUTC > endUTC) {
            return false; // Регистрация уже закончилась
        }

        return true;
    }

    /**
     * Получить детальный статус регистрации
     * Возвращает: 'open', 'closed', 'not_started', 'not_opened_yet'
     */
    async getRegistrationStatus() {
        const settings = await this.getSettings();
        const now = new Date();
        const nowUTC = Date.now();
        const currentYear = now.getFullYear();

        // Если даты не установлены
        if (!settings.registration_start || !settings.registration_end || !settings.championship_datetime) {
            return {
                status: 'not_started',
                isOpen: false,
                message: 'Регистрация еще не началась'
            };
        }

        const startDate = new Date(settings.registration_start);
        const endDate = new Date(settings.registration_end);
        const championshipDate = new Date(settings.championship_datetime);
        
        const startUTC = startDate.getTime();
        const endUTC = endDate.getTime();
        const championshipYear = championshipDate.getFullYear();

        // Если текущий год больше года чемпионата - регистрация еще не началась
        if (currentYear > championshipYear) {
            return {
                status: 'not_started',
                isOpen: false,
                message: 'Регистрация еще не началась'
            };
        }

        // Если текущая дата позже даты закрытия регистрации
        if (nowUTC > endUTC) {
            return {
                status: 'closed',
                isOpen: false,
                message: 'Регистрация на текущий год закрыта'
            };
        }

        // Если текущая дата до даты начала регистрации
        if (nowUTC < startUTC) {
            return {
                status: 'not_opened_yet',
                isOpen: false,
                message: 'Регистрация еще не открыта'
            };
        }

        // Регистрация открыта (текущая дата >= дата начала регистрации и <= дата закрытия)
        return {
            status: 'open',
            isOpen: true,
            message: 'Регистрация открыта'
        };
    }

    /**
     * Очистить данные для нового года
     * Удаляет: пользователей (кроме админов), команды, рассадку, токены
     * НЕ трогает: школы, файлы, настройки, аудитории, результаты чемпионата
     */
    async clearDataForNewYear() {
        const sequelize = require('../db');
        const UserModel = require('../models/user-model');
        const TeamModel = require('../models/team-model');
        const SeatingAssignmentModel = require('../models/seating-assignment-model');
        const TokenModel = require('../models/token-model');

        const transaction = await sequelize.transaction();

        try {
            // 1. Удаляем рассадку (сначала, чтобы не было проблем с внешними ключами)
            await SeatingAssignmentModel.destroy({ 
                where: {},
                transaction 
            });

            // 2. Обнуляем teamId у всех участников перед удалением команд
            await UserModel.update(
                { teamId: null, isLead: false },
                { 
                    where: { role: 'participant' },
                    transaction 
                }
            );

            // 3. Удаляем команды
            await TeamModel.destroy({ 
                where: {},
                transaction 
            });

            // 4. Удаляем токены участников (токены админов тоже можно удалить, они перелогинятся)
            await TokenModel.destroy({ 
                where: {},
                transaction 
            });

            // 5. Удаляем пользователей (кроме админов)
            const deletedUsersCount = await UserModel.destroy({ 
                where: {
                    role: 'participant'
                },
                transaction 
            });

            await transaction.commit();

            return {
                success: true,
                message: 'Данные успешно очищены',
                deletedUsers: deletedUsersCount
            };
        } catch (error) {
            await transaction.rollback();
            throw ApiError.BadRequest(`Ошибка при очистке данных: ${error.message}`);
        }
    }
}

module.exports = new SettingsService();

