import $api from '../http';

export default class ParticipantsService {
    static async getAll(params = {}) {
        return $api.get('/admin/participants', { params });
    }

    static async getStats() {
        return $api.get('/admin/participants/stats');
    }

    static async getById(id) {
        return $api.get(`/admin/participants/${id}`);
    }

    static async exportToExcel() {
        return $api.get('/admin/participants/export', {
            responseType: 'blob'
        });
    }

    static async deleteParticipant(id) {
        return $api.delete(`/admin/participants/${id}`);
    }

    static async updatePlace(id, place) {
        return $api.put(`/admin/participants/${id}/place`, { place });
    }

    static async sendEssayReminders() {
        return $api.post('/admin/participants/send-essay-reminders');
    }

    static async sendTeamFormatWithoutTeamReminders() {
        return $api.post('/admin/participants/send-team-format-without-team-reminders');
    }

    // Метод для волонтера
    static async getAllForVolunteer(params = {}) {
        return $api.get('/volunteer/participants/list', { params });
    }
}

