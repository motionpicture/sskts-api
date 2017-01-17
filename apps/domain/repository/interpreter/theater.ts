import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/Theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";
import COA = require("@motionpicture/coa-service");

namespace interpreter {
    function createFromDocument(doc: mongoose.Document): Theater {
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

    export async function storeFromCOA(theaterByCOA: COA.findTheaterInterface.Result) {
        await store(new Theater(
            theaterByCOA.theater_code,
            {
                ja: theaterByCOA.theater_name,
                en: theaterByCOA.theater_name_eng,
            },
            theaterByCOA.theater_name_kana,
            {
                ja: "",
                en: "",
            }
        ));
    }
}

let i: TheaterRepository = interpreter;
export default i;