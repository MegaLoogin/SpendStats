import { model, Schema } from "mongoose";

export const UserSchema = new Schema({
    username: {type: String, unique: true},
    tgId: {type: Schema.Types.BigInt},
    password: {type: String, requried: true},
    offers: {type: Object, default: {}},
    type: {type: String, default: "aff"},
    allowedOffers: {type: [String], default: null}
}, {versionKey: false});

export default model('User', UserSchema);