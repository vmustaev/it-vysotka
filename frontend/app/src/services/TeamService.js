import $api from "../http";

export default class TeamService {
    // Создание команды
    static async createTeam(name) {
        return $api.post('/team/create', { name });
    }

    // Присоединение к команде по токену
    static async joinTeam(inviteToken) {
        return $api.post(`/team/join/${inviteToken}`);
    }

    // Получение информации о своей команде
    static async getMyTeam() {
        return $api.get('/team/my');
    }

    // Выход из команды
    static async leaveTeam() {
        return $api.post('/team/leave');
    }

    // Исключение участника (только капитан)
    static async kickMember(userId) {
        return $api.delete(`/team/kick/${userId}`);
    }

    // Удаление команды (только капитан)
    static async deleteTeam() {
        return $api.delete('/team/delete');
    }
}
