import AuthService from "./service/AuthService.js";
import { makeAutoObservable } from 'mobx'
import { api } from "./service/api.js";

export default class Store{
    user = {}
    isAuth = false;

    constructor(){
        makeAutoObservable(this);
    }

    setAuth(auth){
        this.isAuth = auth;
    }

    setUser(user){
        this.user = user;
    }

    async login(username, password){
        try{
            const response = await AuthService.login(username, password);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        }catch(e){
            console.log(e)
        }
    }

    async logout(){
        try{
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({});
        }catch(e){
            console.log(e);
        }
    }

    async checkAuth(){
        try{
            const response = await api.get("/refresh");
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        }catch(e){
            console.log(e);
        }
    }
}