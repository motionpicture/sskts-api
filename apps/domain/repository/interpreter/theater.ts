import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/Theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Theater {
        return new Theater(
            doc.get("_id"),
            doc.get("name"),
            doc.get("name_kana"),
            doc.get("address"),
        );
    }

    export async function findById(id: string) {
        let theater = await TheaterModel.findOne({ _id: id }).exec();
        if (!theater) return monapt.None;

        return monapt.Option(createFromDocument(theater));
    }

    export async function store(theater: Theater) {
        await TheaterModel.findOneAndUpdate({ _id: theater._id }, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: TheaterRepository = interpreter;
export default i;