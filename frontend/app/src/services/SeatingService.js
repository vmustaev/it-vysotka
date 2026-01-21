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
     * Получить список нерассаженных команд и участников
     */
    static async getUnassigned() {
        return $api.get('/admin/seating/unassigned');
    }

    /**
     * Добавить нерассаженных участников в существующую рассадку
     */
    static async addUnassigned() {
        return $api.post('/admin/seating/add-unassigned');
    }

    /**
     * Удалить назначение
     */
    static async removeAssignment(teamId, userId) {
        return $api.post('/admin/seating/remove', { teamId, userId });
    }
}
