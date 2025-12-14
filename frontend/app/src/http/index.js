import axios from 'axios';

export const API_URL = `http://localhost:80/api`;

let accessToken = "";

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const clearAccessToken = () => {
    accessToken = "";
};

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
});

$api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});


$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.post(`${API_URL}/refresh`, { withCredentials: true });
            accessToken = response.data.accessToken;
            return $api.request(originalRequest);
        } catch (e) {
            console.log('НЕ АВТОРИЗОВАН');
            sessionStorage.removeItem('wasAuth');
            clearAccessToken();
        }
    }
    throw error;
});

export default $api;