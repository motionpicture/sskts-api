"use strict";
const COA = require("../../common/utils/coa");
/**
 * スクリーン検索
 */
function find(theaterCode) {
    ;
    return new Promise((resolve, reject) => {
        COA.findScreensByTheaterCode(theaterCode, (err, screens) => {
            if (err)
                return reject(err);
            resolve(screens);
        });
    });
}
exports.find = find;
