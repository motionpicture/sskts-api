import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import FilmRepository from "../film";
import * as FilmFactory from "../../factory/film";
import FilmModel from "./mongoose/model/film";

let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let filmModel = db.model(FilmModel.modelName, FilmModel.schema);

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Film {
        return FilmFactory.create({
            _id: doc.get("_id"),
            coa_title_code: doc.get("coa_title_code"),
            coa_title_branch_num: doc.get("coa_title_branch_num"),
            theater: doc.get("theater"),
            name: doc.get("name"),
            name_kana: doc.get("name_kana"),
            name_short: doc.get("name_short"),
            name_original: doc.get("name_original"),
            minutes: doc.get("minutes"),
            date_start: doc.get("date_start"),
            date_end: doc.get("date_end"),
            kbn_eirin: doc.get("kbn_eirin"),
            kbn_eizou: doc.get("kbn_eizou"),
            kbn_joueihousiki: doc.get("kbn_joueihousiki"),
            kbn_jimakufukikae: doc.get("kbn_jimakufukikae")
        });
    }

    export async function findById(id: string) {
        let film = await filmModel.findOne({ _id: id }).exec();
        if (!film) return monapt.None;

        return monapt.Option(createFromDocument(film));
    }

    export async function store(film: Film) {
        await filmModel.findOneAndUpdate({ _id: film._id }, film, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: FilmRepository = interpreter;
export default i;