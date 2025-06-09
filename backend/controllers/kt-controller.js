import axios from "axios";

const { KT_DOMAIN, KT_TOKEN } = process.env;

const api = axios.create({
    baseURL: `https://${KT_DOMAIN}/admin_api/v1`
});

api.defaults.headers.common['Api-Key'] = KT_TOKEN;

class KTController{
    async getBuyers(req, res){
        try{
            const groups = (await api.get("/groups?type=offers")).data;
            return res.json(groups);
        }catch(e){
            console.log(e);
        }
    }

    async getOffers(req, res){
        try{
            const { buyerId } = req.body;
            let avaliableGeos = new Set();
            const offers = (await api.get("/offers")).data/*.filter(v => {
                avaliableGeos.add(...v.country);
                return v.group_id == buyerId;
            });*/
            
            return res.json({offers, avaliableGeos: [...avaliableGeos]});
        }catch(e){
            console.log(e);
        }
    }

    async getData(req, res){
        try{
            const { date, timezone, offerId } = req.body;
            const data = (await api.post("/conversions/log", {
                range: { from: date + " 0:00", to: date + " 23:59", timezone },
                limit: 1000, offset: 0,
                columns: [ "sub_id", "revenue", "original_status" ],
                filters: [ 
                    { name: "offer_id", operator: "EQUALS", expression: offerId }
                ],
                sort: [ { name: "postback_datetime", order: "ASC" } ]
            })).data.rows;

            let ftdCount = 0;
            data.forEach(v => {if(v.original_status == "sale") ftdCount++});

            return res.json({data, ftdCount});
        }catch(e){
            console.log(e);
        }
    }

    async getClicks(req, res){
        try{
            const { date, timezone, offerId } = req.body;
            const data = (await api.post("/clicks/log", {
                range: { from: date + " 0:00", to: date + " 23:59", timezone },
                limit: 20000, offset: 0,
                columns: [ "sub_id", "is_unique_campaign", "is_lead", "is_sale", "sale_revenue", "sub_id_6" ],
                filters: [ 
                    { name: "offer_id", operator: "EQUALS", expression: offerId }
                ],
                sort: [ { name: "datetime", order: "ASC" } ]
            })).data.rows;

            let ftdCount = 0;
            data.forEach(v => {if(v.is_sale) ftdCount++});

            return res.json({data, ftdCount});
        }catch(e){
            console.log(e);
        }
    }
}

export default new KTController();
