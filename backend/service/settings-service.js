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
        if (!settingsObj.championship_datetime) {
            settingsObj.championship_datetime = null;
        }

        return settingsObj;
    }

    /**
     * Обновить настройки
     */
    async updateSettings(settingsData) {
        const { registration_start, registration_end, championship_datetime } = settingsData;

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
}

module.exports = new SettingsService();

