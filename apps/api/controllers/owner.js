"use strict";
const models_1 = require("../../common/models");
/**
 * 所有者作成
 */
function create(group) {
    // TODO group文字列のバリデーション
    return new Promise((resolve, reject) => {
        models_1.owner.create({
            group: group,
        }).then((owner) => {
            resolve({
                _id: owner.get("_id"),
                group: owner.get("group")
            });
        }, (err) => {
            reject(err);
        });
    });
}
exports.create = create;
