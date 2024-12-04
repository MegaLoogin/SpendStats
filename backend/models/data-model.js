import mongoose, { model, Schema } from "mongoose";

export const DataSchema = new Schema({
    date: Date,
    user: Schema.Types.ObjectId,
    click: Number,
    lead: Number,
    sale: Number,
    spend: Number,
    revenue: Number,
    profit: Number
}, {versionKey: false});

const namesList = [];

let models = {};

mongoose.connection.on("open", async function (ref) {
    console.log("Connected to mongo server.");
        mongoose.connection.db.listCollections().toArray().then(function (names) {
        for (let i = 0; i < names.length; i++) {
            const nameOnly = names[i].name;
            if(nameOnly != "offers" && nameOnly != "users"){
                namesList.push(nameOnly);
                models[nameOnly] = model('Data'+nameOnly, DataSchema, nameOnly);
            }
        }
    });
});

export async function createModel(name) {
    models[name] = model('Data'+name, DataSchema, name.toString());
    models[name].createCollection();
}

export default models;