import { Router } from "express";
import ktController from "./controllers/kt-controller.js";
import dbController from "./controllers/db-controller.js";
import userController from "./controllers/user-controller.js";
import auth from "./middle/auth.js";
import tgService from "./service/tg-service.js";

export const router = new Router();

router.use((req, res, next) => {
    // const b = JSON.stringify(req.body)
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);

    const originalSend = res.send;
  
    res.send = function (body) {
      console.log(`⬅️ Response for ${req.method} ${req.originalUrl}`);
      console.log('Body:', typeof body === 'string' && body.length > 500 ? body.slice(0, 500) + '... (truncated)' : body);
  
      return originalSend.call(this, body);
    };
  
    next();
});


router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);

router.get("/getBuyers", auth, ktController.getBuyers);
router.post("/getOffers", auth, ktController.getOffers);
router.post("/getData", auth, ktController.getData);
router.post("/getClicks", auth, ktController.getClicks);

router.post("/addData", auth, dbController.addData);
router.get("/getOffers", auth, dbController.getOffers);
router.post("/getOffersByUser", auth, dbController.getOffersByUser);
router.get("/getUsers", auth, dbController.getUsers);
router.post("/getDataByFilter", auth, dbController.getDataByFilter);

router.get('/getTotal', (req, res) => { tgService.resendTotal(); res.send(200); });