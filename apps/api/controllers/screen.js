"use strict";
const COA = require("../../common/utils/coa");
const ScreenModel = require("../../common/models/screen");
function findById(id) {
    return new Promise((resolve, reject) => {
        ScreenModel.default.findOne({
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
function importByTheaterCode(theaterCode) {
    return new Promise((resolveAll, rejectAll) => {
        COA.findScreensByTheaterCodeInterface.call({
            theater_code: theaterCode
        }, (err, screens) => {
            if (err)
                return rejectAll(err);
            let promises = screens.map((screen) => {
                return new Promise((resolve, reject) => {
                    if (!screen.screen_code)
                        return resolve();
                    let seats = screen.list_seat.map((seat) => {
                        return {
                            code: seat.seat_num
                        };
                    });
                    ScreenModel.default.findOneAndUpdate({
                        _id: `${theaterCode}${screen.screen_code}`
                    }, {
                        theater: theaterCode,
                        name: {
                            ja: screen.screen_name,
                            en: screen.screen_name_eng
                        },
                        sections: [
                            {
                                code: "0",
                                name: {
                                    ja: "セクション0",
                                    en: "section0",
                                },
                                seats: seats
                            }
                        ]
                    }, {
                        new: true,
                        upsert: true
                    }, (err) => {
                        console.log('screen updated.', err);
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
}
exports.importByTheaterCode = importByTheaterCode;
