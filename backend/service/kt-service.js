import axios from "axios";

const KT_DOMAIN = process.env.KT_DOMAIN;
const KT_TOKEN = process.env.KT_TOKEN;

const api = axios.create({
    baseURL: `https://${KT_DOMAIN}/admin_api/v1`
});
api.defaults.headers.common['Api-Key'] = KT_TOKEN;

export async function getClicksFromKT(date, offerId, timezone = "Europe/Moscow") {
    const response = await api.post("/clicks/log", {
        range: { from: date + " 0:00", to: date + " 23:59", timezone },
        limit: 20000, offset: 0,
        columns: [ "sub_id", "is_unique_campaign", "is_lead", "is_sale", "sale_revenue", "sub_id_6" ],
        filters: [ { name: "offer_id", operator: "EQUALS", expression: offerId } ],
        sort: [ { name: "datetime", order: "ASC" } ]
    });
    return response.data.rows;
} 