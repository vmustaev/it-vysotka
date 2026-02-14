import $api from "../http";

export default class VolunteerService {
    static async createVolunteer(email, password, firstName, lastName, secondName) {
        return $api.post('/admin/volunteers', {
            email,
            password,
            firstName,
            lastName,
            secondName
        });
    }

    static async getVolunteers() {
        return $api.get('/admin/volunteers');
    }

    static async deleteVolunteer(volunteerId) {
        return $api.delete(`/admin/volunteers/${volunteerId}`);
    }

    static async updateVolunteerPassword(volunteerId, newPassword) {
        return $api.put(`/admin/volunteers/${volunteerId}/password`, {
            newPassword
        });
    }
}

