"use strict";
const COA = require("../modules/coa");
/**
 * パフォーマンス検索
 */
function find(theaterCode) {
    ;
    return new Promise((resolve, reject) => {
        COA.findPerformancesByTheaterCode(theaterCode, (err, performances) => {
            if (err)
                return reject(err);
            resolve(performances);
        });
    });
}
exports.find = find;
