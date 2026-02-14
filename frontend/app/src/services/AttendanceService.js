import $api from "../http";

export default class AttendanceService {
    static async getParticipantsWithSeating() {
        return $api.get('/volunteer/participants');
    }

    static async markAttendance(userId, attendance) {
        return $api.post('/volunteer/attendance/mark', { userId, attendance });
    }

    static async markMultipleAttendance(userIds, attendance) {
        return $api.post('/volunteer/attendance/mark-multiple', { userIds, attendance });
    }

    static async getStatistics() {
        return $api.get('/volunteer/attendance/statistics');
    }

    static async exportAllRoomsToPDF() {
        return $api.get('/volunteer/attendance/export-all-rooms', {
            responseType: 'blob'
        });
    }

    static async getAttendanceHistory(userId) {
        return $api.get(`/volunteer/attendance/history/${userId}`);
    }

    static async getAllAttendanceHistory(limit = 100, offset = 0) {
        return $api.get('/admin/attendance/history', {
            params: { limit, offset }
        });
    }
}

