import tokenService from "../service/token-service.js";
import { ApiError } from "./error.js";

export function getTokenData(req){
    const authHeader = req.headers.authorization;
    if(!authHeader) throw ApiError.UnauthorizedError();

    const token = authHeader.split(" ")[1];
    if(!token) throw ApiError.UnauthorizedError();

    const userData = tokenService.validateToken(token);
    if(!userData) throw ApiError.UnauthorizedError();

    return userData;
}

export default function(req, res, next){
    try{
        const userData = getTokenData(req);

        req.user = userData;
        next();
    }catch(e){
        throw ApiError.UnauthorizedError();
    }
}