const settingsService = require('../service/settings-service');
const ApiError = require('../exceptions/api-error');

class SettingsController {
    /**
     * Получить настройки
     */
    async getSettings(req, res, next) {
        try {
            const settings = await settingsService.getSettings();
            return res.json({
                success: true,
                data: settings
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Обновить настройки
     */
    async updateSettings(req, res, next) {
        try {
            const { registration_start, registration_end, championship_datetime, essay_close_date } = req.body;

            const settings = await settingsService.updateSettings({
                registration_start,
                registration_end,
                championship_datetime,
                essay_close_date
            });

            return res.json({
                success: true,
                data: settings,
                message: 'Настройки успешно обновлены'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Проверить статус регистрации (публичный endpoint)
     */
    async getRegistrationStatus(req, res, next) {
        try {
            const registrationStatus = await settingsService.getRegistrationStatus();
            const settings = await settingsService.getSettings();
            
            return res.json({
                success: true,
                data: {
                    ...registrationStatus,
                    registration_start: settings.registration_start,
                    registration_end: settings.registration_end,
                    championship_datetime: settings.championship_datetime,
                    essay_close_date: settings.essay_close_date
                }
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Очистить данные для нового года (админ)
     */
    async clearDataForNewYear(req, res, next) {
        try {
            const result = await settingsService.clearDataForNewYear();
            return res.json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SettingsController();

