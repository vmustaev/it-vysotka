const SettingsModel = require('../models/settings-model');
const ApiError = require('../exceptions/api-error');

class SettingsService {
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

        return settingsObj;
    }

    /**
     * Обновить настройки
     */
    async updateSettings(settingsData) {
        const { registration_start, registration_end } = settingsData;

        // Валидация дат
        if (registration_start && registration_end) {
            const startDate = new Date(registration_start);
            const endDate = new Date(registration_end);
            
            if (startDate >= endDate) {
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

        return await this.getSettings();
    }

    /**
     * Проверить, открыта ли регистрация
     */
    async isRegistrationOpen() {
        const settings = await this.getSettings();
        const now = new Date();
        
        // Если даты не установлены, регистрация открыта
        if (!settings.registration_start && !settings.registration_end) {
            return true;
        }

        // Проверяем дату начала
        if (settings.registration_start) {
            const startDate = new Date(settings.registration_start);
            // Сравниваем в UTC, чтобы избежать проблем с часовыми поясами
            const nowUTC = Date.now();
            const startUTC = startDate.getTime();
            if (nowUTC < startUTC) {
                return false; // Регистрация еще не началась
            }
        }

        // Проверяем дату окончания
        if (settings.registration_end) {
            const endDate = new Date(settings.registration_end);
            // endDate уже в UTC (из ISO строки)
            // Используем именно то время, которое ввел пользователь
            // Не устанавливаем конец дня, так как пользователь указал конкретное время
            const nowUTC = Date.now();
            const endUTC = endDate.getTime();
            
            if (nowUTC > endUTC) {
                return false; // Регистрация уже закончилась
            }
        }

        return true;
    }
}

module.exports = new SettingsService();

