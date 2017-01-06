"use strict";
const OwnerModel = require("../../common/models/owner");
function create(group) {
    return new Promise((resolve, reject) => {
        if (!OwnerModel.isAvailableGroup(group))
            return reject(new Error("invalid group name."));
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
function findByIdAndUpdate(args) {
    return new Promise((resolve, reject) => {
        OwnerModel.default.findOneAndUpdate({
            _id: args._id
        }, {
            $set: args
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
