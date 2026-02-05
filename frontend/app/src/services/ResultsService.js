import $api from '../http';

export default class ResultsService {
    /**
     * Получить список всех годов
     */
    static async getYears() {
        return $api.get('/results/years');
    }

    /**
     * Получить результаты по году
     */
    static async getResultsByYear(year) {
        return $api.get(`/results/year/${year}`);
    }

    /**
     * Получить все результаты (админ)
     */
    static async getAllResults() {
        return $api.get('/admin/results');
    }

    /**
     * Создать результат (админ)
     */
    static async createResult(resultData) {
        return $api.post('/admin/results', resultData);
    }

    /**
     * Обновить результат (админ)
     */
    static async updateResult(id, resultData) {
        return $api.put(`/admin/results/${id}`, resultData);
    }

    /**
     * Удалить результат (админ)
     */
    static async deleteResult(id) {
        return $api.delete(`/admin/results/${id}`);
    }

    /**
     * Автоматически создать результаты из участников с расставленными местами (админ)
     */
    static async createResultsFromParticipants(year) {
        return $api.post('/admin/results/from-participants', { year });
    }

    /**
     * Отправить письма победителям (админ)
     */
    static async sendWinnerNotifications() {
        return $api.post('/admin/results/send-winner-notifications');
    }
}

