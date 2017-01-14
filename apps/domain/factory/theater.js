"use strict";
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
    return {
        _id: theaterByCOA.theater_code,
        name: {
            ja: theaterByCOA.theater_name,
            en: theaterByCOA.theater_name_eng,
        },
        name_kana: theaterByCOA.theater_name_kana,
        address: {
            ja: "",
            en: "",
        },
    };
}
exports.createByCOA = createByCOA;
