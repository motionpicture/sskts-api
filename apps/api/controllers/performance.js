"use strict";
const models_1 = require("../../common/models");
/**
 * パフォーマンス詳細
 */
function findById(id) {
    return new Promise((resolve, reject) => {
        models_1.performance.findOne({
            _id: id
        })
            .populate('film', 'name minutes copyright')
            .exec((err, performance) => {
            if (err)
                return reject(err);
            if (!performance)
                return reject(new Error("Not Found."));
            resolve({
                _id: performance.get("_id"),
                screen: performance.get("screen"),
                screen_name: performance.get("screen_name"),
                theater: performance.get("theater"),
                theater_name: performance.get("theater_name"),
                film: performance.get("film").get("_id"),
                film_name: performance.get("film").get("name"),
                day: performance.get("day"),
                time_start: performance.get("time_start"),
                time_end: performance.get("time_end")
            });
        });
    });
}
exports.findById = findById;
function find(conditions) {
    // 検索条件を作成
    let andConditions = [];
    if (conditions.day) {
        andConditions.push({
            day: conditions.day
        });
    }
    if (conditions.theater) {
        andConditions.push({
            theater: conditions.theater
        });
    }
    return new Promise((resolve, reject) => {
        models_1.performance.find({ $and: andConditions })
            .populate('film', 'name minutes copyright')
            .lean(true)
            .exec((err, performances) => {
            if (err)
                return reject(err);
            resolve(performances);
        });
    });
}
exports.find = find;
