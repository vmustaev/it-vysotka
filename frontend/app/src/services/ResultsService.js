import $api from '../http';

export default class ResultsService {
    static async getYears() {
        return $api.get('/results/years');
    }

    static async getResultsByYear(year) {
        return $api.get(`/results/year/${year}`);
    }

    static async getAllResults() {
        return $api.get('/admin/results');
    }

    static async createResult(resultData) {
        return $api.post('/admin/results', resultData);
    }

    static async updateResult(id, resultData) {
        return $api.put(`/admin/results/${id}`, resultData);
    }

    static async deleteResult(id) {
        return $api.delete(`/admin/results/${id}`);
    }

    static async createResultsFromParticipants(year) {
        return $api.post('/admin/results/from-participants', { year });
    }

    static async sendWinnerNotifications() {
        return $api.post('/admin/results/send-winner-notifications');
    }
}

