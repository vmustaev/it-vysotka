import $api from "../http";

export default class AuthService {
    static async login(email, password) {
        return $api.post('/login', { email, password });
    }

    static async registration(formData) {
        return $api.post('/registration', formData);
    }

    static async logout() {
        return $api.post('/logout');
    }
}