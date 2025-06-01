import userModel from "../models/user-model.js";
import bcrypt from 'bcrypt';
import tokenService from "./token-service.js";
import { ApiError } from "../middle/error.js";
import dbService from "./db-service.js";

class UserService{
    async registration(username, tgId = 0, password, type, btag = ""){
        let user = await userModel.findOne({username});
        if(user) {
            user.password = await bcrypt.hash(password, 3);
            user.save();
            // throw ApiError.BadRequest("User already exists");
        } else {
            user = await dbService.addUser(username, password, tgId, type, btag);
        }

        // const hash = await bcrypt.hash(password, 3);
        // const user = await userModel.create({name: username, password: hash});
        
        const session = await tokenService.saveToken(user._id);
        const tokens = tokenService.generateTokens({username: user.username, id: user._id, session, type, btag});
        await tokenService.saveToken(user._id, tokens.refreshToken, session);

        return {...tokens, session};
    }

    async login(username, password){
        const user = await userModel.findOne({username});
        if(!user) throw ApiError.BadRequest("User not found");
        
        const isPass = await bcrypt.compare(password, user.password);
        if(!isPass) throw ApiError.BadRequest("Incorrect password");

        const session = await tokenService.saveToken(user._id);
        const tokens = tokenService.generateTokens({username: user.username, id: user._id, session, type: user.type, allowedOffers: user.allowedOffers, btag: user.btag});
        await tokenService.saveToken(user._id, tokens.refreshToken, session);

        return {...tokens, session, user: {username: user.username, type: user.type, btag: user.btag}};
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken) throw ApiError.UnauthorizedError();

        const userData = tokenService.validateToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDb) throw ApiError.UnauthorizedError();

        const tokens = tokenService.generateTokens({username: userData.username, id: userData.id, session: userData.session, type: userData.type, allowedOffers: userData.allowedOffers, btag: userData.btag});
        await tokenService.saveToken(userData.id, tokens.refreshToken, userData.session);

        console.log('userData', userData);

        return {...tokens, session: userData.session, user: {username: userData.username, type: userData.type, btag: userData.btag}};
    }

    async getUsers(){
        const users = await userModel.find();
        return users;
    }
}

export default new UserService();