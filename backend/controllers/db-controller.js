import { getTokenData } from "../middle/auth.js";
import dbService from "../service/db-service.js";

class DBController {
    async addData(req, res){
        try{
            const { offerData, data, spend, buyerName, date } = req.body;

            await dbService.addDataToOffer(offerData, buyerName, date, data, spend);

            res.json({"status": "ok"});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    async getOffers(req, res){
        const tokenData = getTokenData(req);
        let username = tokenData.username;
        if(tokenData.type !== "aff") username = null;

        try{
            res.json({"status": "ok", "data": await dbService.getOffers(username)});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    async getUsers(req, res){
        const tokenData = getTokenData(req);
        let username = tokenData.username;
        if(tokenData.type === "admin") username = null;

        try{
            res.json({"status": "ok", "data": await dbService.getUsers(username)});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    async getOffersByUser(req, res){
        try{
            const { userId } = req.body;
            res.json({"status": "ok", "data": await dbService.getOffersByUser(userId)});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    async getDataByFilter(req, res){
        const tokenData = getTokenData(req);
        console.log(tokenData);
        try{
            const filter = req.body;

            res.json({"status": "ok", "data": await dbService.getDataByFilter(filter, tokenData.username, tokenData.type)});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    // async getDataByOffer(req, res){
    //     try{
    //         const { offerId, dateStart, dateEnd } = req.body;


    //     }catch(e){
    //         console.log(e);
    //         res.json({"status": "error", "text": e.message});
    //     }
    // }
}

export default new DBController();