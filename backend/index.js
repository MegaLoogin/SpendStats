import cors from "cors";
import express from "express";
import { router } from "./router.js";
import mongoose from "mongoose";
import tgService from "./service/tg-service.js";
import cron from "node-cron";
import userService from "./service/user-service.js";
import userModel from "./models/user-model.js";
import cookieParser from "cookie-parser";
import dbService from "./service/db-service.js";

const { MONGO_USER, MONGO_PASS, MONGO_DB } = process.env;

const app = express();
const url = `mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/${MONGO_DB}?authSource=admin`;

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb'}));
app.use(router);

// cron.schedule("0 12 * * *", tgService.resendBuyers);
// cron.schedule("0 8 * * *", tgService.resendTotal);

// Каждый день в 3:00 ночи
cron.schedule("0 3 * * *", async () => {
    try {
        console.log('Начинаю массовый перерасчет статистики за 30 дней...');
        await dbService.recalcAllStatsFor30Days();
        console.log('Массовый перерасчет завершен!');
    } catch (e) {
        console.error('Ошибка массового перерасчета:', e);
    }
});

(async () => {
    await mongoose.connect(url);
    if(!(await userModel.findOne({username: "admin"}))) await userService.registration("admin", 0, process.env.ADMIN_PASS, "admin");
    app.listen(8181, () => console.log("Backend started!"));
})();