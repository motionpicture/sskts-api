import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import Theater from "../../model/theater";
import FilmRepository from "../film";
import FilmModel from "./mongoose/model/film";
import COA = require("@motionpicture/coa-service");

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

    export function storeFromCOA(filmByCOA: COA.findFilmsByTheaterCodeInterface.Result) {
        return async (theater: Theater) => {
            await store(new Film(
                // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
                `${theater._id}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
                filmByCOA.title_code,
                filmByCOA.title_branch_num,
                theater,
                {
                    ja: filmByCOA.title_name,
                    en: filmByCOA.title_name_eng
                },
                filmByCOA.title_name_kana,
                filmByCOA.title_name_short,
                filmByCOA.title_name_orig,
                filmByCOA.show_time,
                filmByCOA.date_begin,
                filmByCOA.date_end,
                filmByCOA.kbn_eirin,
                filmByCOA.kbn_eizou,
                filmByCOA.kbn_joueihousiki,
                filmByCOA.kbn_jimakufukikae
            ));
        }
    }
}

let i: FilmRepository = interpreter;
export default i;