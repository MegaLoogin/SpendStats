import { Model } from "mongoose";
import models, { createModel } from "../models/data-model.js";
import offerModel from "../models/offer-model.js";
import userModel from "../models/user-model.js";
import bcrypt from 'bcrypt';
import { ApiError } from "../middle/error.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

// const localDate = (date) => date ? new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' }) : new Date().toLocaleString('en-CA', { timeZone: 'Europe/Moscow' });

class DBService {
    async addUser(username, password, tgId, type){
        try{
            const hash = await bcrypt.hash(password.toString(), 3);
            const user = await userModel.create({username, password: hash, tgId, type});
            // const user = await userModel.create({username, tgId});
            await user.save();
            return user;
        }catch(e){
            console.log(e);
        }
    }

    async addOffer(idName, title, name, geo, dateStart, isSpend){
        try{
            const offer = await offerModel.create({idName, name, title, geo, dateStart, isSpend});
            await offer.save();
            await createModel(idName);

            return offer;
        }catch(e){
            console.log(e);
        }
    }

    async linkUserToOffer(username, offerId){
        try{
            const user = await userModel.findOne({username});
            const offer = await offerModel.findOne({idName: offerId});

            user.offers[offerId] = {
                offerId: offer.id,
                lastDate: new Date()
            };
            // await user.set(`offers[${offerId}]`, {offerId: offer.id,
            //     lastDate: new Date()});
            // console.log(await user.updateOne({$set: {[`offers[${offerId}]`]: {
            //     offerId: offer.id,
            //     lastDate: new Date()
            // }}}));
            offer.users.push(user.id);

            // console.log(user.offers);

            await user.save();
            await offer.save();
        }catch(e){
            console.log(e);
        }
    }

    async updateOfferLastDate(user, offerIdName){
        try{
            // user.offers[offerIdName] = {};
            user.offers[offerIdName].lastDate = new Date();
            user.markModified('offers');
            await user.save();
        }catch(e){
            console.log(e);
        }
    }

    async addDataToOffer(offerData, username, date, data, spend){
        spend = parseFloat(spend);
        let user = await userModel.findOne({username});
        let offer = await offerModel.findOne({idName: offerData.id});

        let needLink = (!user) || (!offer);

        if(!user) user = await this.addUser(username, username, 0, "buyer");

        if(!offer) offer = await this.addOffer(offerData.id, offerData.name, offerData.name.split("|")[2].trim("").toLowerCase(), offerData.country, (new Date()).toISOString(), offerData.payout_auto);

        if(needLink) await this.linkUserToOffer(username, offerData.id);

        const offerDataModel = models[offer.idName];

        await offerDataModel.deleteOne({date, user: user.id});

        let click = 0;
        let lead = 0;
        let sale = 0;
        let revenue = 0;
        let profit = 0;

        data.forEach(v => {
            if(v.is_unique_campaign) click++;
            if(v.is_lead) lead++;
            if(v.is_sale) sale++;
            revenue += v.sale_revenue;
        });

        if(offer.isSpend) revenue = spend * 1.3;

        profit = revenue - spend;

        (await offerDataModel.create({user: user.id, spend, profit, revenue, click, lead, sale, date})).save();

        if( (new Date()) - (new Date(date)) < ONE_DAY )
            await this.updateOfferLastDate(user, offer.idName);
    }

    async getOffers(username){
        if(!username){
            const offers = await offerModel.find({});
            return offers;
        }else{
            const filter = new RegExp("^" + username);
            const offers = await offerModel.find({name: filter});
            return offers;
        }
    }

    async getUsers(username){
        BigInt.prototype.toJSON = function () {
            const int = Number.parseInt(this.toString());
            return int ?? this.toString();
        };

        if(!username){
            const users = await userModel.find({});
            return users;
        }else{
            const users = await userModel.find({username});
            return users;
        }
    }

    arrayToObject = (arr, key) =>
        arr.reduce((acc, obj) => {
            acc[obj[key]] = obj;
            return acc;
        }, {});

    mergeObjectsWithFilter = (objects, allowedKeys) => {
        return objects.reduce((acc, current) => {
            for (const key in current) {
                acc[key] = acc[key] || {};
      
                for (const nestedKey in current[key]) {
                    if (allowedKeys.includes(nestedKey)) {
                        acc[key][nestedKey] = (acc[key][nestedKey] || 0) + current[key][nestedKey];
                    }
                }
            }
            return acc;
        }, {});
    };
      

    async getDataByFilter(filter, username, userType){
        const { dateStart, dateEnd, offerId, userId, geo, offerName } = filter;

        if(offerId && userId){
            const offer = await offerModel.findById(offerId);
            if(!offer) throw new Error(`Offer ${offerId} not found!`);

            const user = await userModel.findById(userId);
            if(!user) throw new Error(`User ${userId} not found!`);
            if((user.username !== username || userType === "aff") && (userType !== "admin")) throw ApiError.PermissionError();

            /** @type {Model} */
            const data = await models[offer.idName];
            const result = await data.find({user: user.id, date: { $gte: dateStart, $lte: dateEnd }}, "-data", {sort: {date: -1}});
            return result;
        // }else if(offerId){
        //     const offer = await offerModel.findById(offerId);
        //     if(!offer) throw new Error(`Offer ${offerId} not found!`);

        //     /** @type {Model} */
        //     const data = await models[offer.idName];
        //     const result = await data.find({date: { $gte: dateStart, $lte: dateEnd }}, "-data", {sort: {date: -1}});
        //     return result;
        }else if(geo && offerName){
            const offers = await offerModel.find({name: offerName, geo: {$in: [geo]}});

            const offersData = [];

            for(let offer of offers){
                /** @type {Model} */
                const data = await models[offer.idName];
                const result = await data.find({date: { $gte: dateStart, $lte: dateEnd }}, "-data", {sort: {date: -1}});
                offersData.push(this.arrayToObject(result, "date"));
            }

            const merged = this.mergeObjectsWithFilter(offersData, ["click", "lead", "sale", "spend", "revenue", "profit"]);
            const result = Object.entries(merged).map(([date, value]) => {date = new Date(date); return { id: date, date, ...value }});
            return result;
        }else{
            // throw new Error(`Incorrect filter!`);
            if(userType !== "admin") throw ApiError.PermissionError();

            const offers = await offerModel.find({});

            const offersData = [];

            for(let offer of offers){
                /** @type {Model} */
                const data = await models[offer.idName];
                const result = await data.find({date: { $gte: dateStart, $lte: dateEnd }}, "-data", {sort: {date: -1}});
                offersData.push(this.arrayToObject(result, "date"));
            }

            const merged = this.mergeObjectsWithFilter(offersData, ["click", "lead", "sale", "spend", "revenue", "profit"]);
            const result = Object.entries(merged).map(([date, value]) => {date = new Date(date); return { id: date, date, ...value }});
            return result;
        }
    }

    async getOffersByUser(userId){
        const user = await userModel.findById(userId);
        if(!user) throw new Error(`User ${userId} not found!`);

        const offers = await offerModel.find({users: { $in: [user.id] }});
        return offers;
    }
}

export default new DBService();