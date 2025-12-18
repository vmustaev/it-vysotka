import $api from "../http";

export default class PasswordService {
    static async requestReset(email) {
        return $api.post('/password/reset/request', { email });
    }

    static async resetPassword(token, newPassword, confirmPassword) {
        return $api.post('/password/reset', { 
            token, 
            newPassword, 
            confirmPassword 
        });
    }
}