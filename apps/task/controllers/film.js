"use strict";
const COA = require("../../common/utils/coa");
const config = require("config");
const mongoose = require("mongoose");
let MONGOLAB_URI = config.get('mongolab_uri');
const models_1 = require("../../common/models");
/**
 * 劇場コード指定で作品情報をCOAからインポートする
 */
function importByTheaterCode(theaterCode) {
    COA.findFilmsByTheaterCode(theaterCode, (err, films) => {
        if (err)
            return process.exit(0);
        mongoose.connect(MONGOLAB_URI);
        // あれば更新、なければ追加
        let promises = films.map((film) => {
            return new Promise((resolve, reject) => {
                if (!film.title_code)
                    return resolve();
                if (!film.title_branch_num)
                    return resolve();
                // this.logger.debug('updating sponsor...');
                models_1.film.findOneAndUpdate({
                    _id: film.title_code + film.title_branch_num
                }, {
                    film_group: film.title_code,
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
            // this.logger.info('promised.');
            mongoose.disconnect();
            process.exit(0);
        }, (err) => {
            // this.logger.error('promised.', err);
            mongoose.disconnect();
            process.exit(0);
        });
    });
}
exports.importByTheaterCode = importByTheaterCode;
