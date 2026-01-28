import http from '../http';

class FileService {
    /**
     * Загрузка файла (Admin)
     * @param {File} file - Файл для загрузки
     * @param {string} fileType - Тип файла (gallery, sponsors, certificates, tasks, regulations, results, other)
     * @param {string} description - Описание файла (необязательно)
     * @param {string} subType - Подтип файла (необязательно)
     * @param {number} year - Год (необязательно, для заданий)
     * @param {number} displayOrder - Порядок отображения (необязательно, для спонсоров)
     * @returns {Promise}
     */
    async uploadFile(file, fileType, description = '', subType = '', year = null, displayOrder = 0) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        if (description) formData.append('description', description);
        if (subType) formData.append('subType', subType);
        if (year) formData.append('year', year);
        if (displayOrder) formData.append('displayOrder', displayOrder);

        const response = await http.post('/admin/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    }

    /**
     * Получить все файлы (Admin)
     * @param {Object} filters - Фильтры (fileType, isActive, uploadedBy)
     * @returns {Promise}
     */
    async getAllFiles(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.fileType) params.append('fileType', filters.fileType);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
        if (filters.uploadedBy) params.append('uploadedBy', filters.uploadedBy);

        const queryString = params.toString();
        const url = queryString ? `/admin/files?${queryString}` : '/admin/files';
        
        const response = await http.get(url);
        return response.data;
    }

    /**
     * Получить файл по ID (Admin)
     * @param {number} id - ID файла
     * @returns {Promise}
     */
    async getFileById(id) {
        const response = await http.get(`/admin/files/${id}`);
        return response.data;
    }

    /**
     * Получить файлы по типу (Public)
     * @param {string} type - Тип файла
     * @param {Object} filters - Фильтры (subType, year)
     * @returns {Promise}
     */
    async getFilesByType(type, filters = {}) {
        const params = new URLSearchParams();
        if (filters.subType) params.append('subType', filters.subType);
        if (filters.year) params.append('year', filters.year);
        
        const queryString = params.toString();
        const url = queryString ? `/files/type/${type}?${queryString}` : `/files/type/${type}`;
        
        const response = await http.get(url);
        return response.data;
    }

    /**
     * Обновить информацию о файле (Admin)
     * @param {number} id - ID файла
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise}
     */
    async updateFile(id, updateData) {
        const response = await http.put(`/admin/files/${id}`, updateData);
        return response.data;
    }

    /**
     * Удалить файл (Admin)
     * @param {number} id - ID файла
     * @returns {Promise}
     */
    async deleteFile(id) {
        const response = await http.delete(`/admin/files/${id}`);
        return response.data;
    }

    /**
     * Получить статистику файлов (Admin)
     * @returns {Promise}
     */
    async getFileStats() {
        const response = await http.get('/admin/files/stats');
        return response.data;
    }

    /**
     * Получить URL файла
     * @param {string} savedFilename - Имя сохраненного файла
     * @returns {string}
     */
    getFileUrl(savedFilename) {
        return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/files/${savedFilename}`;
    }
}

export default new FileService();
