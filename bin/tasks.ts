import TheaterRepository from "../apps/domain/repository/interpreter/theater";
import Theater from "../apps/domain/model/Theater";
// import * as TheaterFactory from "../apps/domain/factory/theater";

import config = require("config");
import mongoose = require("mongoose");
let MONGOLAB_URI = config.get<string>("mongolab_uri");

// let env = process.env.NODE_ENV || "dev";

import COA = require("@motionpicture/coa-service");
COA.initialize({
    endpoint: config.get<string>("coa_api_endpoint"),
    refresh_token: config.get<string>("coa_api_refresh_token")
});

export function importTheater(code: string) {
    return new Promise((resolve, reject) => {
        mongoose.connect(MONGOLAB_URI);

        COA.findTheaterInterface.call({
            theater_code: code
        }, (err, theaterByCOA) => {
            if (err) return reject(err);
            if (!theaterByCOA) return reject(new Error("theater not found."));

            let theater: Theater = {
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
            // let theater = TheaterFactory.create({
            // });
            // あれば更新、なければ追加
            TheaterRepository.store(theater).then(() => {
                mongoose.disconnect();
                resolve();
            }, (err) => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}