import $api from '../http';

export default class SeatingService {
    /**
     * Автоматическая рассадка
     */
    static async autoAssign() {
        return $api.post('/admin/seating/auto-assign');
    }

    /**
     * Получить текущую рассадку
     */
    static async getSeating() {
        return $api.get('/admin/seating');
    }

    /**
     * Очистить рассадку
     */
    static async clearSeating() {
        return $api.delete('/admin/seating/clear');
    }

    /**
     * Ручное назначение команды/участника в аудиторию
     */
    static async assignItem(teamId, userId, roomId) {
        return $api.post('/admin/seating/assign', { teamId, userId, roomId });
    }

    /**
     * Удалить назначение
     */
    static async removeAssignment(teamId, userId) {
        return $api.post('/admin/seating/remove', { teamId, userId });
    }
}
