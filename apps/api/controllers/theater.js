"use strict";
const models_1 = require("../../common/models");
/**
 * コードから劇場情報を取得する
 */
function findByCode(code) {
    return new Promise((resolve, reject) => {
        models_1.theater.findOne({
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
