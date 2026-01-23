import $api from '../http';

export default class SettingsService {
    /**
     * Получить настройки
     */
    static async getSettings() {
        return $api.get('/admin/settings');
    }

    /**
     * Обновить настройки
     */
    static async updateSettings(settings) {
        return $api.put('/admin/settings', settings);
    }

    /**
     * Получить статус регистрации (публичный endpoint)
     */
    static async getRegistrationStatus() {
        return $api.get('/settings/registration-status');
    }
}

