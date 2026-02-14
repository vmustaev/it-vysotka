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

    static updateEssayUrl(essayUrl) {
        return $api.put('/user/essay-url', { essayUrl })
    }

    static updateProfile(profileData) {
        return $api.put('/user/profile', profileData)
    }

    static getProfileHistory(userId) {
        return $api.get(`/volunteer/participants/${userId}/profile-history`)
    }
}