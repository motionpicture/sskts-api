import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/theater";
import * as TheaterFactory from "../../factory/theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";
import COA = require("@motionpicture/coa-service");

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

    export async function storeFromCOA(theaterByCOA: COA.findTheaterInterface.Result) {
        let theater =  TheaterFactory.create({
            _id: theaterByCOA.theater_code,
            name: {
                ja: theaterByCOA.theater_name,
                en: theaterByCOA.theater_name_eng,
            },
            name_kana: theaterByCOA.theater_name_kana,
            address: {
                ja: "",
                en: "",
            },
        });

        await store(theater);
    }
}

let i: TheaterRepository = interpreter;
export default i;