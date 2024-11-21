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
}

export default new DBController();