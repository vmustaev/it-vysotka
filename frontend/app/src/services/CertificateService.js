import $api from '../http';

class CertificateService {
    
    // Загрузка шаблона сертификата
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

    // Загрузка шрифта
    async uploadFont(file) {
        const formData = new FormData();
        formData.append('font', file);

        return $api.post('/admin/certificates/upload-font', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Получение настроек
    async getSettings() {
        return $api.get('/admin/certificates/settings');
    }

    // Получение файла шаблона
    async getTemplateFile() {
        return $api.get('/admin/certificates/template', {
            responseType: 'blob'
        });
    }

    // Обновление настроек
    async updateSettings(settings) {
        return $api.put('/admin/certificates/settings', settings);
    }

    // Предпросмотр сертификата
    async preview(participantId) {
        const url = participantId 
            ? `/admin/certificates/preview/${participantId}`
            : '/admin/certificates/preview';
        
        return $api.get(url, {
            responseType: 'blob'
        });
    }

    // Генерация одного сертификата
    async generateOne(participantId) {
        return $api.get(`/admin/certificates/generate/${participantId}`, {
            responseType: 'blob'
        });
    }

    // Генерация всех сертификатов
    async generateAll() {
        return $api.post('/admin/certificates/generate-all');
    }
}

export default new CertificateService();

