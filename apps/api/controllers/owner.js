"use strict";
const OwnerModel = require("../../common/models/owner");
/**
 * 所有者作成
 */
function create(group) {
    // TODO group文字列のバリデーション
    return new Promise((resolve, reject) => {
        OwnerModel.default.create({
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
/**
 * 所有者更新
 */
function findByIdAndUpdate(id, update) {
    return new Promise((resolve, reject) => {
        OwnerModel.default.findOneAndUpdate({
            _id: id
        }, {
            $set: update
        }, {
            new: true,
            upsert: false
        }, ((err, owner) => {
            if (err)
                return reject(err);
            if (!owner)
                return reject(new Error("owner not found."));
            resolve({
                _id: owner.get("_id"),
                group: owner.get("group"),
                name: owner.get("name"),
                email: owner.get("email"),
                tel: owner.get("tel"),
            });
        }));
    });
}
exports.findByIdAndUpdate = findByIdAndUpdate;
