"use strict";
const COA = require("../modules/coa");
/**
 * コードから劇場情報を取得する
 */
function findByCode(code) {
    return new Promise((resolve, reject) => {
        COA.publishAccessToken((err, accessToken) => {
            if (err)
                return reject(err);
            COA.findTheaterByCode(accessToken, code, (err, theater) => {
                if (err)
                    return reject(err);
                resolve({
                    theater_code: theater.theater_code,
                    theater_name_ja: theater.theater_name,
                    theater_name_en: theater.theater_name_eng,
                    theater_name_kana: theater.theater_name_kana,
                });
            });
        });
    });
}
exports.findByCode = findByCode;
