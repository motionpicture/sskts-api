"use strict";
const FilmModel = require("../../common/models/film");
const COA = require("../../common/utils/coa");
function findById(id) {
    return new Promise((resolve, reject) => {
        FilmModel.default.findOne({
            _id: id
        }, (err, film) => {
            if (err)
                return reject(err);
            if (!film)
                return reject(new Error("Not Found."));
            resolve({
                _id: film.get("_id"),
                name: film.get("name"),
                name_kana: film.get("name_kana"),
                name_short: film.get("name_short"),
                name_original: film.get("name_original"),
                minutes: film.get("minutes"),
                date_start: film.get("date_start"),
                date_end: film.get("date_end"),
                kbn_eirin: film.get("kbn_eirin"),
                kbn_eizou: film.get("kbn_eizou"),
                kbn_joueihousiki: film.get("kbn_joueihousiki"),
                kbn_jimakufukikae: film.get("kbn_jimakufukikae"),
                copyright: film.get("copyright"),
                coa_title_code: film.get("coa_title_code"),
                coa_title_branch_num: film.get("coa_title_branch_num"),
            });
        });
    });
}
exports.findById = findById;
function importByTheaterCode(theaterCode) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findFilmsByTheaterCodeInterface.call({
            theater_code: theaterCode
        }, (err, films) => {
            if (err)
                return rejectAll(err);
            let promises = films.map((film) => {
                return new Promise((resolve, reject) => {
                    if (!film.title_code)
                        return resolve();
                    if (!film.title_branch_num)
                        return resolve();
                    FilmModel.default.findOneAndUpdate({
                        _id: `${theaterCode}${film.title_code}${film.title_branch_num}`
                    }, {
                        coa_title_code: film.title_code,
                        coa_title_branch_num: film.title_branch_num,
                        theater: theaterCode,
                        name: {
                            ja: film.title_name,
                            en: film.title_name_eng
                        },
                        name_kana: film.title_name_kana,
                        name_short: film.title_name_short,
                        name_original: film.title_name_orig,
                        minutes: film.show_time,
                        date_start: film.date_begin,
                        date_end: film.date_end,
                        kbn_eirin: film.kbn_eirin,
                        kbn_eizou: film.kbn_eizou,
                        kbn_joueihousiki: film.kbn_joueihousiki,
                        kbn_jimakufukikae: film.kbn_jimakufukikae,
                    }, {
                        new: true,
                        upsert: true
                    }, (err) => {
                        console.log('film updated.', err);
                        (err) ? reject(err) : resolve();
                    });
                });
            });
            Promise.all(promises).then(() => {
                resolveAll();
            }, (err) => {
                rejectAll(err);
            });
        });
    });
}
exports.importByTheaterCode = importByTheaterCode;
