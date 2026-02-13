import $api from '../http';

export default class SeatingService {
    static async autoAssign() {
        return $api.post('/admin/seating/auto-assign');
    }

    static async getSeating() {
        return $api.get('/admin/seating');
    }

    static async clearSeating() {
        return $api.delete('/admin/seating/clear');
    }

    static async assignItem(teamId, userId, roomId) {
        return $api.post('/admin/seating/assign', { teamId, userId, roomId });
    }

    static async getUnassigned() {
        return $api.get('/admin/seating/unassigned');
    }

    static async addUnassigned() {
        return $api.post('/admin/seating/add-unassigned');
    }

    static async removeAssignment(teamId, userId) {
        return $api.post('/admin/seating/remove', { teamId, userId });
    }

    static async exportToExcel() {
        return $api.get('/admin/seating/export', {
            responseType: 'blob'
        });
    }
}
