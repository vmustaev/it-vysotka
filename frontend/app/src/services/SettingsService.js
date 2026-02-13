import $api from '../http';

export default class SettingsService {
    static async getSettings() {
        return $api.get('/admin/settings');
    }

    static async updateSettings(settings) {
        return $api.put('/admin/settings', settings);
    }

    static async getRegistrationStatus() {
        return $api.get('/settings/registration-status');
    }

    static async clearDataForNewYear() {
        return $api.post('/admin/settings/clear-data');
    }
}

