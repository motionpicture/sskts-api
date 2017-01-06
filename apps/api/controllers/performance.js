"use strict";
const COA = require("../../common/utils/coa");
const PerformanceModel = require("../../common/models/performance");
const ScreenModel = require("../../common/models/screen");
function findById(id) {
    return new Promise((resolve, reject) => {
        PerformanceModel.default.findOne({
            _id: id
        })
            .populate("film", "name minutes copyright coa_title_code coa_title_branch_num")
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
                coa_title_code: performance.get("film").get("coa_title_code"),
                coa_title_branch_num: performance.get("film").get("coa_title_branch_num"),
                day: performance.get("day"),
                time_start: performance.get("time_start"),
                time_end: performance.get("time_end"),
            });
        });
    });
}
exports.findById = findById;
function find(conditions) {
    let andConditions = [
        { _id: { $ne: null } }
    ];
    if (conditions.day) {
        andConditions.push({ day: conditions.day });
    }
    if (conditions.theater) {
        andConditions.push({ theater: conditions.theater });
    }
    return new Promise((resolve, reject) => {
        PerformanceModel.default.find({ $and: andConditions })
            .populate("film", "name minutes copyright")
            .lean(true)
            .exec((err, performances) => {
            if (err)
                return reject(err);
            resolve(performances);
        });
    });
}
exports.find = find;
function importByTheaterCode(theaterCode, begin, end) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findPerformancesByTheaterCodeInterface.call({
            theater_code: theaterCode,
            begin: begin,
            end: end,
        }, (err, performances) => {
            if (err)
                return rejectAll(err);
            ScreenModel.default.find({ theater: theaterCode }, "name theater sections").populate("theater", "name").exec((err, screens) => {
                if (err)
                    return rejectAll(err);
                let promises = performances.map((performance) => {
                    return new Promise((resolve, reject) => {
                        if (!performance.title_code)
                            return resolve();
                        if (!performance.title_branch_num)
                            return resolve();
                        if (!performance.screen_code)
                            return resolve();
                        let id = `${theaterCode}${performance.date_jouei}${performance.title_code}${performance.title_branch_num}${performance.screen_code}${performance.time_begin}`;
                        let screenCode = `${theaterCode}${performance.screen_code}`;
                        let filmCode = `${theaterCode}${performance.title_code}${performance.title_branch_num}`;
                        let _screen = screens.find((screen) => {
                            return (screen.get("_id").toString() === screenCode);
                        });
                        if (!_screen)
                            return reject("no screen.");
                        console.log("updating performance...");
                        PerformanceModel.default.findOneAndUpdate({
                            _id: id
                        }, {
                            screen: _screen.get("_id"),
                            screen_name: _screen.get("name"),
                            theater: _screen.get("theater").get("_id"),
                            theater_name: _screen.get("theater").get("name"),
                            film: filmCode,
                            day: performance.date_jouei,
                            time_start: performance.time_begin,
                            time_end: performance.time_end
                        }, {
                            new: true,
                            upsert: true
                        }, (err) => {
                            console.log("performance updated.", err);
                            if (err)
                                return reject(err);
                            resolve();
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
function importSeatAvailability(theaterCode, start, end) {
    return new Promise((resolve, reject) => {
        COA.countFreeSeatInterface.call({
            theater_code: theaterCode,
            begin: start,
            end: end,
        }, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
}
exports.importSeatAvailability = importSeatAvailability;
