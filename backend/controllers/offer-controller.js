
import offerModel from "../models/offer-model.js";
import models from "../models/data-model.js";
import userModel from "../models/user-model.js";

const offerController = {
    async getNumericIdOffers(req, res) {
        try {
            // Получаем все коллекции в базе
            const collections = await req.app.get('mongoose').connection.db.listCollections().toArray();
            let result = [];
            for (const col of collections) {
                // Пропускаем служебные коллекции
                if (['offers', 'users', 'tokens'].includes(col.name)) continue;
                // Получаем модель для коллекции
                const DataModel = models[col.name] || req.app.get('mongoose').model('Data'+col.name);
                // Получаем все документы (клики) из коллекции
                const docs = await DataModel.find({});
                for (const doc of docs) {
                    // Находим пользователя по ObjectId
                    const user = await userModel.findById(doc.user);
                    result.push({
                        btag: user ? user.btag : null,
                        spend: doc.spend,
                        date: doc.date ? doc.date.toISOString().slice(0, 10) : null,
                        commission: 4,
                        offer_id: col.name,
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
