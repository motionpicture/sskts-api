"use strict";
const models_1 = require("../../common/models");
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
