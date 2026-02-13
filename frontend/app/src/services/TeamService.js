import $api from "../http";

export default class TeamService {
    static async createTeam(name) {
        return $api.post('/team/create', { name });
    }

    static async joinTeam(inviteToken) {
        return $api.post(`/team/join/${inviteToken}`);
    }

    static async getMyTeam() {
        return $api.get('/team/my');
    }

    static async leaveTeam() {
        return $api.post('/team/leave');
    }

    static async kickMember(userId) {
        return $api.delete(`/team/kick/${userId}`);
    }

    static async deleteTeam() {
        return $api.delete('/team/delete');
    }

    static async getAllTeams() {
        return $api.get('/admin/teams');
    }
}
