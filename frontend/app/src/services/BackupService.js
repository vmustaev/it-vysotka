import http from '../http';

class BackupService {
    async getBackups() {
        const response = await http.get('/admin/backups');
        return response.data;
    }

    async createBackup() {
        const response = await http.post('/admin/backups');
        return response.data;
    }

    getDownloadUrl(filename) {
        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
        return `${baseUrl}/api/admin/backups/download/${encodeURIComponent(filename)}`;
    }

    async downloadBackup(filename) {
        const response = await http.get(`/admin/backups/download/${encodeURIComponent(filename)}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    async deleteBackup(filename) {
        const response = await http.delete(`/admin/backups/${encodeURIComponent(filename)}`);
        return response.data;
    }
}

export default new BackupService();
