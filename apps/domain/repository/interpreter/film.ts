import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/Film";
import FilmRepository from "../film";
import FilmModel from "./mongoose/model/film";

namespace interpreter {
    export function createFromDocument(doc: mongoose.Document): Film {
        return new Film(
            doc.get("_id"),
            doc.get("coa_title_code"),
            doc.get("coa_title_branch_num"),
            doc.get("theater"),
            doc.get("name"),
            doc.get("name_kana"),
            doc.get("name_short"),
            doc.get("name_original"),
            doc.get("minutes"),
            doc.get("date_start"),
            doc.get("date_end"),
            doc.get("kbn_eirin"),
            doc.get("kbn_eizou"),
            doc.get("kbn_joueihousiki"),
            doc.get("kbn_jimakufukikae")
        );
    }

    export async function findById(id: string) {
        let film = await FilmModel.findOne({ _id: id }).exec();
        if (!film) return monapt.None;

        return monapt.Option(createFromDocument(film));
    }

    export async function store(film: Film) {
        await FilmModel.findOneAndUpdate({ _id: film._id }, film, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}

let i: FilmRepository = interpreter;
export default i;