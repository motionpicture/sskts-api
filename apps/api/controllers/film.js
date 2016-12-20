"use strict";
const COA = require("../../common/utils/coa");
/**
 * 作品検索
 */
function find(theaterCode) {
    return new Promise((resolve, reject) => {
        COA.findFilmsByTheaterCode(theaterCode, (err, films) => {
            if (err)
                return reject(err);
            // 出力したい形式に変換
            let results = films.map((film) => {
                return {
                    code: film.title_code,
                    branch_num: film.title_branch_num,
                    name_ja: film.title_name,
                    name_en: film.title_name_eng,
                    name_kana: film.title_name_kana,
                    name_short: film.title_name_short,
                    name_original: film.title_name_orig,
                    kbn_eirin: film.kbn_eirin,
                    kbn_eizou: film.kbn_eizou,
                    kbn_joueihousiki: film.kbn_joueihousiki,
                    kbn_jimakufukikae: film.kbn_jimakufukikae,
                    minutes: film.show_time,
                    date_start: film.date_begin,
                    date_end: film.date_end
                };
            });
            resolve(results);
        });
    });
}
exports.find = find;
