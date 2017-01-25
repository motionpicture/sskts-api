import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/theater";
import * as TheaterFactory from "../../factory/theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let theaterModel = db.model(TheaterModel.modelName, TheaterModel.schema);

namespace interpreter {
    function createFromDocument(doc: mongoose.Document): Theater {
        return TheaterFactory.create({
            _id: doc.get("_id"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            address: doc.get("address"),
        });
    }

    export async function findById(id: string) {
        let theater = await theaterModel.findOne({ _id: id }).exec();
        if (!theater) return monapt.None;

        return monapt.Option(createFromDocument(theater));
    }

    export async function store(theater: Theater) {
        await theaterModel.findOneAndUpdate({ _id: theater._id }, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: TheaterRepository = interpreter;
export default i;