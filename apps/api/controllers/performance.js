"use strict";
const COA = require("../../common/utils/coa");
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
/**
 * 劇場コード指定でパフォーマンス情報をCOAからインポートする
 */
function importByTheaterCode(theaterCode, begin, end) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findPerformancesByTheaterCodeInterface.call({
            theater_code: theaterCode,
            begin: begin,
            end: end,
        }, (err, performances) => {
            if (err)
                return rejectAll(err);
            models_1.screen.find({ theater: theaterCode }, 'name theater').populate('theater', 'name').exec((err, screens) => {
                // あれば更新、なければ追加
                let promises = performances.map((performance) => {
                    return new Promise((resolve, reject) => {
                        if (!performance.title_code)
                            return resolve();
                        if (!performance.title_branch_num)
                            return resolve();
                        if (!performance.screen_code)
                            return resolve();
                        // this.logger.debug('updating sponsor...');
                        let id = `${performance.date_jouei}${performance.title_code}${performance.title_branch_num}${performance.screen_code}${performance.time_begin}`;
                        // 劇場とスクリーン名称を追加
                        let _screen = screens.find((screen) => {
                            return (screen.get("_id").toString() === performance.screen_code);
                        });
                        if (!_screen)
                            return reject("no screen.");
                        console.log("updating performance...");
                        models_1.performance.findOneAndUpdate({
                            _id: id
                        }, {
                            screen: performance.screen_code,
                            screen_name: _screen.get("name"),
                            theater: _screen.get("theater").get("_id"),
                            theater_name: _screen.get("theater").get("name"),
                            film: performance.title_code + performance.title_branch_num,
                            day: performance.date_jouei,
                            time_start: performance.time_begin,
                            time_end: performance.time_end
                        }, {
                            new: true,
                            upsert: true
                        }, (err) => {
                            console.log('performance updated.', err);
                            // this.logger.debug('sponsor updated', err);
                            (err) ? reject(err) : resolve();
                        });
                    });
                });
                Promise.all(promises).then(() => {
                    resolveAll();
                }, (err) => {
                    rejectAll(err);
                });
            });
        });
    });
}
exports.importByTheaterCode = importByTheaterCode;
