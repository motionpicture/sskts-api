"use strict";
const COA = require("../modules/coa");
/**
 * 作品検索
 */
function find(theaterCode) {
    return new Promise((resolve, reject) => {
        COA.findFilmsByTheaterCode(theaterCode, (err, films) => {
            if (err)
                return reject(err);
            resolve(films);
        });
    });
}
exports.find = find;
