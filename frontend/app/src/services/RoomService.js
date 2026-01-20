import $api from '../http';

export default class RoomService {
    /**
     * Получить список всех аудиторий
     */
    static async getAll() {
        return $api.get('/admin/rooms');
    }

    /**
     * Получить аудиторию по ID
     */
    static async getById(id) {
        return $api.get(`/admin/rooms/${id}`);
    }

    /**
     * Создать новую аудиторию
     */
    static async create(number, capacity) {
        return $api.post('/admin/rooms', { number, capacity });
    }

    /**
     * Обновить аудиторию
     */
    static async update(id, number, capacity) {
        return $api.put(`/admin/rooms/${id}`, { number, capacity });
    }

    /**
     * Удалить аудиторию
     */
    static async delete(id) {
        return $api.delete(`/admin/rooms/${id}`);
    }
}
