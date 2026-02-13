import $api from '../http';

class CertificateService {
    
    async uploadTemplate(file, settings) {
        const formData = new FormData();
        formData.append('template', file);
        formData.append('textX', settings.textX || 0);
        formData.append('textY', settings.textY || 0);
        formData.append('fontSize', settings.fontSize || 110);
        formData.append('fontColor', settings.fontColor || '#023664');

        return $api.post('/admin/certificates/upload-template', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async uploadFont(file) {
        const formData = new FormData();
        formData.append('font', file);

        return $api.post('/admin/certificates/upload-font', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async getSettings() {
        return $api.get('/admin/certificates/settings');
    }

    async getTemplateFile() {
        return $api.get('/admin/certificates/template', {
            responseType: 'blob'
        });
    }

    async updateSettings(settings) {
        return $api.put('/admin/certificates/settings', settings);
    }

    async preview(participantId) {
        const url = participantId 
            ? `/admin/certificates/preview/${participantId}`
            : '/admin/certificates/preview';
        
        return $api.get(url, {
            responseType: 'blob'
        });
    }

    async generateOne(participantId) {
        return $api.get(`/admin/certificates/generate/${participantId}`, {
            responseType: 'blob'
        });
    }

    async generateAll() {
        return $api.post('/admin/certificates/generate-all');
    }

    async issueCertificates(participantIds) {
        return $api.post('/admin/certificates/issue', { participantIds });
    }

    async downloadCertificate(participantId) {
        return $api.get(`/certificates/download/${participantId}`, {
            responseType: 'blob'
        });
    }

    async sendCertificateNotifications() {
        return $api.post('/admin/certificates/send-notifications');
    }
}

export default new CertificateService();

