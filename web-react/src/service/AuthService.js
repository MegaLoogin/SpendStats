import {api} from "./api.js";

export default class AuthService{
    static async login(username, password){
        return api.post('/login', {username, password});
    }

    static async logout(){
        return api.post('/logout');
    }
}