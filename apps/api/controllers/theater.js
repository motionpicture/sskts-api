"use strict";
const COA = require("../../common/utils/coa");
const TheaterModel = require("../../common/models/theater");
/**
 * コードから劇場情報を取得する
 */
function findByCode(code) {
    return new Promise((resolve, reject) => {
        TheaterModel.default.findOne({
            _id: code
        }, (err, theater) => {
            if (err)
                return reject(err);
            resolve({
                theater_code: theater.get("_id"),
                theater_name_ja: theater.get("name").ja,
                theater_name_en: theater.get("name").en,
                theater_name_kana: theater.get("name_kana")
            });
        });
    });
}
exports.findByCode = findByCode;
/**
 * コード指定で劇場情報をCOAからインポートする
 */
function importByCode(code) {
    return new Promise((resolve, reject) => {
        COA.findTheaterInterface.call({
            theater_code: code
        }, (err, theater) => {
            if (err)
                return reject(err);
            // あれば更新、なければ追加
            // this.logger.debug('updating sponsor...');
            TheaterModel.default.findOneAndUpdate({
                _id: theater.theater_code
            }, {
                name: {
                    ja: theater.theater_name,
                    en: theater.theater_name_eng
                },
                name_kana: theater.theater_name_kana
            }, {
                new: true,
                upsert: true
            }, (err, theater) => {
                console.log("theater updated.", theater);
                // this.logger.debug('sponsor updated', err);
                (err) ? reject(err) : resolve();
            });
        });
    });
}
exports.importByCode = importByCode;
