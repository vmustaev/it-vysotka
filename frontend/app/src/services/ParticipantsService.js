import $api from '../http';

export default class ParticipantsService {
    /**
     * Получить список участников с фильтрами и пагинацией
     */
    static async getAll(params = {}) {
        return $api.get('/admin/participants', { params });
    }

    /**
     * Получить статистику участников
     */
    static async getStats() {
        return $api.get('/admin/participants/stats');
    }

    /**
     * Получить детальную информацию об участнике
     */
    static async getById(id) {
        return $api.get(`/admin/participants/${id}`);
    }

    /**
     * Экспорт в Excel
     * Возвращает blob для скачивания файла
     */
    static async exportToExcel() {
        return $api.get('/admin/participants/export', {
            responseType: 'blob' // Важно для получения файла
        });
    }

    /**
     * Удалить участника
     */
    static async deleteParticipant(id) {
        return $api.delete(`/admin/participants/${id}`);
    }

    /**
     * Обновить место участника
     */
    static async updatePlace(id, place) {
        return $api.put(`/admin/participants/${id}/place`, { place });
    }
}

