
import offerModel from "../models/offer-model.js";
import models from "../models/data-model.js";
import userModel from "../models/user-model.js";

const offerController = {
    async getNumericIdOffers(req, res) {
        try {
            // Получаем все офферы с числовым idName
            const offers = await offerModel.find({ idName: { $type: "number" } });
            let result = [];
            for (const offer of offers) {
                const model = models[offer.idName];
                if (!model) continue;
                // Получаем все документы (клики) для этого оффера
                const docs = await model.find({});
                for (const doc of docs) {
                    // Находим пользователя по ObjectId
                    const user = await userModel.findById(doc.user);
                    result.push({
                        btag: user ? user.btag : null,
                        spend: doc.spend,
                        date: doc.date ? doc.date.toISOString().slice(0, 10) : null,
                        commission: 4
                    });
                }
            }
            res.json({ status: "ok", data: result });
        } catch (e) {
            res.status(500).json({ status: "error", message: e.message });
        }
    }
};

export default offerController;
