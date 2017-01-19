"use strict";
const theater_1 = require("../model/theater");
function create(args) {
    return {
        _id: args._id,
        name: args.name,
        name_kana: args.name_kana,
        address: args.address,
    };
}
exports.create = create;
function createByCOA(theaterByCOA) {
    return new theater_1.default(theaterByCOA.theater_code, {
        ja: theaterByCOA.theater_name,
        en: theaterByCOA.theater_name_eng,
    }, theaterByCOA.theater_name_kana, {
        ja: "",
        en: "",
    });
}
exports.createByCOA = createByCOA;
