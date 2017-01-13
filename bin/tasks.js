"use strict";
const theater_1 = require("../apps/domain/repository/interpreter/theater");
const config = require("config");
const mongoose = require("mongoose");
let MONGOLAB_URI = config.get("mongolab_uri");
const COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get("coa_api_endpoint"),
    refresh_token: config.get("coa_api_refresh_token")
});
function importTheater(code) {
    return new Promise((resolve, reject) => {
        mongoose.connect(MONGOLAB_URI);
        COA.findTheaterInterface.call({
            theater_code: code
        }, (err, theaterByCOA) => {
            if (err)
                return reject(err);
            if (!theaterByCOA)
                return reject(new Error("theater not found."));
            let theater = {
                _id: theaterByCOA.theater_code,
                name: {
                    ja: theaterByCOA.theater_name,
                    en: theaterByCOA.theater_name_eng
                },
                name_kana: theaterByCOA.theater_name_kana,
                address: {
                    ja: "",
                    en: "",
                },
            };
            theater_1.default.store(theater).then(() => {
                mongoose.disconnect();
                resolve();
            }, (err) => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}
exports.importTheater = importTheater;
