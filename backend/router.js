import { Router } from "express";
import ktController from "./kt-controller.js";
import dbController from "./db-controller.js";

export const router = new Router();

router.get("/getBuyers", ktController.getBuyers);
router.post("/getOffers", ktController.getOffers);
router.post("/getData", ktController.getData);
router.post("/getClicks", ktController.getClicks);

router.post("/addData", dbController.addData);