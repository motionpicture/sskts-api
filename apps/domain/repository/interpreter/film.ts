import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import Theater from "../../model/theater";
import FilmRepository from "../film";
import * as FilmFactory from "../../factory/film";
import FilmModel from "./mongoose/model/film";
import COA = require("@motionpicture/coa-service");

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
            let film = FilmFactory.create({
                // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
                _id: `${theater._id}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
                coa_title_code: filmByCOA.title_code,
                coa_title_branch_num: filmByCOA.title_branch_num,
                theater: theater,
                name: {
                    ja: filmByCOA.title_name,
                    en: filmByCOA.title_name_eng
                },
                name_kana: filmByCOA.title_name_kana,
                name_short: filmByCOA.title_name_short,
                name_original: filmByCOA.title_name_orig,
                minutes: filmByCOA.show_time,
                date_start: filmByCOA.date_begin,
                date_end: filmByCOA.date_end,
                kbn_eirin: filmByCOA.kbn_eirin,
                kbn_eizou: filmByCOA.kbn_eizou,
                kbn_joueihousiki: filmByCOA.kbn_joueihousiki,
                kbn_jimakufukikae: filmByCOA.kbn_jimakufukikae
            });

            await store(film);
        }
    }
}

let i: FilmRepository = interpreter;
export default i;