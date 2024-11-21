import { Model } from "mongoose";
import models, { createModel } from "./models/data-model.js";
import offerModel from "./models/offer-model.js";
import userModel from "./models/user-model.js";

class DBService {
    async addUser(username, tgId){
        try{
            const user = await userModel.create({name: username, tgId});
            await user.save();
            return user;
        }catch(e){
            console.log(e);
        }
    }

    async addOffer(idName, name, geo, dateStart, isSpend){
        try{
            const offer = await offerModel.create({idName, name, geo, dateStart, isSpend});
            await offer.save();
            await createModel(idName);

            return offer;
        }catch(e){
            console.log(e);
        }
    }

    async linkUserToOffer(username, offerId){
        try{
            const user = await userModel.findOne({name: username});
            const offer = await offerModel.findOne({idName: offerId});

            user.offers[offerId] = {
                offerId: offer.id,
                lastDate: Date.now()
            };
            offer.users.push(user.id);

            await user.save();
            await offer.save();
        }catch(e){
            console.log(e);
        }
    }

    async addDataToOffer(offerData, username, date, data, spend){
        spend = parseFloat(spend);
        let user = await userModel.findOne({name: username});
        let offer = await offerModel.findOne({idName: offerData.id});

        let needLink = (!user) || (!offer);

        if(!user) user = await this.addUser(username, 0);

        if(!offer) offer = await this.addOffer(offerData.id, offerData.name, offerData.country, Date.now(), offerData.payout_auto);

        if(needLink) await this.linkUserToOffer(username, offerData.id);

        console.log(models, offer);
        const offerDataModel = models[offer.idName];

        await offerDataModel.deleteOne({date, user: user.id});

        let clicks = 0;
        let lead = 0;
        let sale = 0;
        let revenue = 0;
        let profit = 0;

        data.data.forEach(v => {
            if(v.is_unique_campaign) clicks++;
            if(v.is_lead) lead++;
            if(v.is_sale) sale++;
            revenue += v.sale_revenue;
        });

        if(offer.isSpend) revenue = spend * 1.3;

        profit = revenue - spend;

        (await offerDataModel.create({user: user.id, spend, profit, revenue, clicks, lead, sale, data, date})).save();
    }
}

export default new DBService();