import $api from "../http";

export default class UserService {
    static fetchUsers() {
        return $api.get('/users')
    }

    static getProfile() {
        return $api.get('/user/profile')
    }

    static updateParticipationFormat(format) {
        return $api.put('/user/participation-format', { participation_format: format })
    }
}