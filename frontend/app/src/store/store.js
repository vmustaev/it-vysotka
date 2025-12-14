import AuthService from "../services/AuthService";
import axios from 'axios';
import { API_URL, setAccessToken, getAccessToken, clearAccessToken } from "../http";
import { makeAutoObservable } from "mobx";

export default class Store {
    user = {};
    isAuth = false;
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
    }

    setLoading(bool) {
        this.isLoading = bool;
    }

    async login(email, password) {
        try {
            const response = await AuthService.login(email, password);
            console.log(response)
            setAccessToken(response.data.accessToken);
            sessionStorage.setItem('wasAuth', 'true');
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            console.log(e.response?.data?.message);
        }
    }

    async registration(email, password) {
        try {
            const response = await AuthService.registration(email, password);
            console.log(response)
            setAccessToken(response.data.accessToken);
            sessionStorage.setItem('wasAuth', 'true');
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            console.log(e.response?.data?.message);
        }
    }

    async logout() {
        try {
            const response = await AuthService.logout();
            sessionStorage.removeItem('wasAuth');
            clearAccessToken();
            this.setAuth(false);
            this.setUser({});
        } catch (e) {
            console.log(e.response?.data?.message);
        }
    }

    async checkAuth() {
        this.setLoading(true);

        const wasAuth = sessionStorage.getItem('wasAuth');
        
        if (!wasAuth) {
            this.setLoading(false);
            return;
        }
        
        try {
            const response = await axios.post(`${API_URL}/refresh`, { withCredentials: true })
            console.log(response);
            setAccessToken(response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            sessionStorage.removeItem('wasAuth');
            clearAccessToken();
            console.log(e.response?.data?.message);
        } finally {
            this.setLoading(false);
        }
    }
}