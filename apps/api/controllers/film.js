"use strict";
const models_1 = require("../../common/models");
const COA = require("../../common/utils/coa");
/**
 * 作品詳細
 */
function findById(id) {
    return new Promise((resolve, reject) => {
        models_1.film.findOne({
            _id: id
        }, (err, film) => {
            if (err)
                return reject(err);
            if (!film)
                return reject(new Error("Not Found."));
            resolve({
                _id: film.get("_id"),
                name: film.get("name"),
                name_kana: film.get("name_kana")
            });
        });
    });
}
exports.findById = findById;
/**
 * 劇場コード指定で作品情報をCOAからインポートする
 */
function importByTheaterCode(theaterCode) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findFilmsByTheaterCodeInterface.call({
            theater_code: theaterCode
        }, (err, films) => {
            if (err)
                return rejectAll(err);
            // あれば更新、なければ追加
            let promises = films.map((film) => {
                return new Promise((resolve, reject) => {
                    if (!film.title_code)
                        return resolve();
                    if (!film.title_branch_num)
                        return resolve();
                    // this.logger.debug('updating sponsor...');
                    models_1.film.findOneAndUpdate({
                        // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
                        _id: `${theaterCode}${film.title_code}${film.title_branch_num}`
                    }, {
                        film_group: film.title_code,
                        film_branch_code: film.title_branch_num,
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
                        date_end: film.date_end // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
                    }, {
                        new: true,
                        upsert: true
                    }, (err) => {
                        console.log('film updated.', err);
                        // this.logger.debug('sponsor updated', err);
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
