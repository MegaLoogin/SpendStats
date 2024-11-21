import mongoose, { model, Schema } from "mongoose";

export const OfferSchema = new Schema({
    idName: {type: Number, unique: true},
    users: [Schema.Types.ObjectId],
    geo: [String],
    name: String,
    dateStart: Date,
    isSpend: Boolean
}, {versionKey: false});

export default model('Offer', OfferSchema);