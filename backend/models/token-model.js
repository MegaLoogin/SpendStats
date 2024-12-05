import { Schema, model } from "mongoose";

const TokenSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, requried: true},
    createdAt: {type: Date, expires: '30d', default: Date.now}
});

export default model('Token', TokenSchema);