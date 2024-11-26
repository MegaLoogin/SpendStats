import cors from "cors";
import express from "express";
import { router } from "./router.js";
import mongoose from "mongoose";
import axios from "axios";

const { MONGO_USER, MONGO_PASS, MONGO_DB } = process.env;

const app = express();
const url = `mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/${MONGO_DB}?authSource=admin`;

app.use(cors({
    credentials: true
}));
app.use(express.json({ limit: '10mb'}));
app.use(router);

(async () => {
    await mongoose.connect(url);
    app.listen(8181, () => console.log("Backend started!"));
})();