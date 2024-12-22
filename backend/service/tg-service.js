import offerModel from "../models/offer-model.js";
import userModel from "../models/user-model.js";
import axios from "axios";
import dbService from "./db-service.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

const tgApiRemind = axios.create({ baseURL: `https://api.telegram.org/bot${process.env.TGBOT_REMINDNER}`});
const tgApiStat = axios.create({ baseURL: `https://api.telegram.org/bot${process.env.TGBOT_STATS}`});

const USERS_STATS = process.env.USERS_STATS.split(',');
const TOTAL_STATS = process.env.TOTAL_STATS.split(',');

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
                        // console.log(res.data);
                    }catch(e){
                        // console.log(e);
                    }
                }
            }
        }
    }

    async resendTotal(){
        const dateFilter = {dateStart: getFormattedYesterday(), dateEnd: getFormattedYesterday()};
        const summaryData = (await dbService.getDataByFilter(dateFilter, "", "admin"))[0];

        const msgTextSummary1 = createTextTable(["click", "lead", "sale"], [[summaryData.click, summaryData.lead, summaryData.sale]]);
        const msgTextSummary2 = createTextTable(["spend", "revenue", "profit"], [[summaryData.spend.toFixed(2) + "$", summaryData.revenue.toFixed(2) + "$", summaryData.profit.toFixed(2) + "$"]]);

        for(let user of TOTAL_STATS){
            try{
                const res = await tgApiStat.post("sendMessage", {
                    chat_id: user,
                    text: `\`\`\`Суммарно за ${dateFilter.dateEnd.split('-').reverse().join('.')}:\n\n${msgTextSummary1}\n\n${msgTextSummary2}\`\`\``,
                    parse_mode: "MarkdownV2"
                });
                // console.log(res.data);
            }catch(e){
                console.log(e);
            }
        }
    }

    async resendSpend(offerData, dataOne){
        const msgTextTitle = (new Date(dataOne.date)).toLocaleDateString("ru-RU", {minimize: true}) + "\n" + "#" + offerData.id + " " + offerData.name + "\n";
        const msgText1 = createTextTable(["click", "lead", "sale"], [[dataOne.click, dataOne.lead, dataOne.sale]]);
        const msgText2 = createTextTable(["spend", "revenue", "profit"], [[dataOne.spend.toFixed(2) + "$", dataOne.revenue.toFixed(2) + "$", dataOne.profit.toFixed(2) + "$"]]);

        const dateFilter = {dateStart: getFormattedYesterday(), dateEnd: getFormattedYesterday()};

        const summaryData = (await dbService.getDataByFilter(dateFilter, "", "admin"))[0];

        const msgTextSummary1 = createTextTable(["click", "lead", "sale"], [[summaryData.click, summaryData.lead, summaryData.sale]]);
        const msgTextSummary2 = createTextTable(["spend", "revenue", "profit"], [[summaryData.spend.toFixed(2) + "$", summaryData.revenue.toFixed(2) + "$", summaryData.profit.toFixed(2) + "$"]]);

        for(let user of USERS_STATS){
            try{
                const res = await tgApiStat.post("sendMessage", {
                    chat_id: user,
                    text: `\`\`\`${msgTextTitle}\n\n${msgText1}\n\n${msgText2}\n\n\nСуммарно за ${dateFilter.dateEnd.split('-').reverse().join('.')}:\n\n${msgTextSummary1}\n\n${msgTextSummary2}\`\`\``,
                    parse_mode: "MarkdownV2"
                });
                // console.log(res.data);
            }catch(e){
                console.log(e);
            }
        }
    }
}

function getYesterdayDate() {
    const today = new Date(); // Текущая дата
    today.setDate(today.getDate() - 1); // Отнимаем 1 день
    return today;
}

function getFormattedYesterday() {
    const today = getYesterdayDate();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Месяцы с 0 (январь = 0)
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function createTextTable(headers, rows) {
    if (!Array.isArray(rows) || !rows.every(row => Array.isArray(row))) {
        throw new TypeError("Each row in 'rows' must be an array.");
    }

    const columnWidths = headers.map((header, colIndex) =>
        Math.max(
            header.length,
            ...rows.map(row => String(row[colIndex]).length)
        )
    );

    function centerText(text, width) {
        const str = String(text);
        const spaces = width - str.length;
        const leftPadding = Math.floor(spaces / 2);
        const rightPadding = spaces - leftPadding;
        return " ".repeat(leftPadding) + str + " ".repeat(rightPadding);
    }

    const headerRow = headers
        .map((header, colIndex) => centerText(header, columnWidths[colIndex]))
        .join(" | ");

    const separator = columnWidths.map(width => "-".repeat(width)).join("-|-");

    const dataRows = rows.map(row =>
        row.map((cell, colIndex) => centerText(cell, columnWidths[colIndex])).join(" | ")
    );

    const table = [headerRow, separator, ...dataRows].join("\n");
    return table;
}

export default new TGService();