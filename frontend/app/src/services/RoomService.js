import $api from '../http';

export default class RoomService {
    static async getAll() {
        return $api.get('/admin/rooms');
    }

    static async getById(id) {
        return $api.get(`/admin/rooms/${id}`);
    }

    static async create(number, capacity) {
        return $api.post('/admin/rooms', { number, capacity });
    }

    static async update(id, number, capacity) {
        return $api.put(`/admin/rooms/${id}`, { number, capacity });
    }

    static async delete(id) {
        return $api.delete(`/admin/rooms/${id}`);
    }
}
