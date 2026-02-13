import axios from 'axios';

export const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const setAccessToken = (token) => {
    localStorage.setItem('accessToken', token);
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken') || '';
};

export const clearAccessToken = () => {
    localStorage.removeItem('accessToken');
};

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
    timeout: 60000
});

$api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
            const responseData = response.data.data || response.data;
            setAccessToken(responseData.accessToken);
            return $api.request(originalRequest);
        } catch (e) {
            console.log('НЕ АВТОРИЗОВАН');
            clearAccessToken();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
    }
    throw error;
});

export default $api;