import http from '../http';

class FileService {
    /**
     * @param {File} file
     * @param {string} fileType
     * @param {string} description
     * @param {string} subType
     * @param {number} year
     * @param {number} displayOrder
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
     * @param {Object} filters
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
     * @param {number} id
     * @returns {Promise}
     */
    async getFileById(id) {
        const response = await http.get(`/admin/files/${id}`);
        return response.data;
    }

    /**
     * @param {string} type
     * @param {Object} filters
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
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise}
     */
    async updateFile(id, updateData) {
        const response = await http.put(`/admin/files/${id}`, updateData);
        return response.data;
    }

    /**
     * @param {number} id
     * @returns {Promise}
     */
    async deleteFile(id) {
        const response = await http.delete(`/admin/files/${id}`);
        return response.data;
    }

    /**
     * @param {Array<number>} ids
     * @returns {Promise}
     */
    async deleteMultipleFiles(ids) {
        const response = await http.post('/admin/files/delete-multiple', { ids });
        return response.data;
    }

    /**
     * @returns {Promise}
     */
    async getFileStats() {
        const response = await http.get('/admin/files/stats');
        return response.data;
    }

    /**
     * @param {string} savedFilename
     * @returns {string}
     */
    getFileUrl(savedFilename) {
        return `${process.env.REACT_APP_API_URL}/files/${savedFilename}`;
    }
}

export default new FileService();
