import cors from "cors";
import express from "express";
import { router } from "./router.js";
import mongoose from "mongoose";
import tgService from "./tg-service.js";
import cron from "node-cron";

const { MONGO_USER, MONGO_PASS, MONGO_DB } = process.env;

const app = express();
const url = `mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/${MONGO_DB}?authSource=admin`;

app.use(cors({
    credentials: true
}));
app.use(express.json({ limit: '10mb'}));
app.use(router);

cron.schedule("0 12 * * *", tgService.resendBuyers);

(async () => {
    await mongoose.connect(url);
    app.listen(8181, () => console.log("Backend started!"));
})();