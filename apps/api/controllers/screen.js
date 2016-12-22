"use strict";
const models_1 = require("../../common/models");
/**
 * スクリーン詳細
 */
function findById(id) {
    return new Promise((resolve, reject) => {
        models_1.screen.findOne({
            _id: id
        })
            .exec((err, screen) => {
            if (err)
                return reject(err);
            if (!screen)
                return reject(new Error("Not Found."));
            resolve({
                _id: screen.get("_id"),
                theater: screen.get("theater"),
                name: screen.get("name"),
                seats_number: screen.get("seats_number"),
                sections: screen.get("sections")
            });
        });
    });
}
exports.findById = findById;
