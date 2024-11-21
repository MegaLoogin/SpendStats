import mongoose, { model, Schema } from "mongoose";

export const UserSchema = new Schema({
    name: {type: String, unique: true},
    tgId: {type: Schema.Types.BigInt, unique: true},
    offers: {type: Object, default: {}}
}, {versionKey: false});

export default model('User', UserSchema);