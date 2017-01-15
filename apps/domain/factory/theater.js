"use strict";
const Theater_1 = require("../model/Theater");
function create(args) {
    return {
        _id: args._id,
        name: {
            ja: args.name_ja,
            en: args.name_en,
        },
        name_kana: args.name_kana,
        address: {
            ja: args.name_ja,
            en: "",
        },
    };
}
exports.create = create;
function createByCOA(theaterByCOA) {
    return new Theater_1.default(theaterByCOA.theater_code, {
        ja: theaterByCOA.theater_name,
        en: theaterByCOA.theater_name_eng,
    }, theaterByCOA.theater_name_kana, {
        ja: "",
        en: "",
    });
}
exports.createByCOA = createByCOA;
