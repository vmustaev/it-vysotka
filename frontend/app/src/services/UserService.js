import $api from "../http";

export default class UserService {
    static fetchUsers() {
        return $api.get('/users')
    }

    static getProfile() {
        return $api.get('/user/profile')
    }
}