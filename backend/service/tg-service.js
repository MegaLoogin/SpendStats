import offerModel from "../models/offer-model.js";
import userModel from "../models/user-model.js";
import axios from "axios";

const ONE_DAY = 24 * 60 * 60 * 1000;

const tgApiRemind = axios.create({ baseURL: `https://api.telegram.org/bot${process.env.TGBOT_REMINDNER}`});
const tgApiStat = axios.create({ baseURL: `https://api.telegram.org/bot${process.env.TGBOT_STATS}`});



class TGService{
    async resendBuyers(){
        const users = await userModel.find({});

        for(let user of users){
            for(let offerKey of Object.keys(user.offers)){
                if((new Date()) - user.offers[offerKey].lastDate > ONE_DAY){
                    try{
                        const offer = await offerModel.findById(user.offers[offerKey].offerId);
                        const res = await tgApiRemind.post("sendMessage", {
                            chat_id: user.tgId.toString(),
                            text: `Вы не обновляли информацию по офферу: ${offer.title}`
                        });
                        console.log(res.data);
                    }catch(e){
                        console.log(e);
                    }
                }
            }
        }
    }
}

export default new TGService();