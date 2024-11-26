import dbService from "./db-service.js";

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
        try{
            res.json({"status": "ok", "data": await dbService.getOffers()});
        }catch(e){
            console.log(e);
            res.json({"status": "error", "text": e.message});
        }
    }

    async getUsers(req, res){
        try{
            res.json({"status": "ok", "data": await dbService.getUsers()});
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
        try{
            const filter = req.body;

            res.json({"status": "ok", "data": await dbService.getDataByFilter(filter)});
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