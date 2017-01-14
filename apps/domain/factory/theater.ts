import Theater from "../model/Theater";
import COA = require("@motionpicture/coa-service");

export function create(args: {
    _id: string,
    name_ja: string,
    name_en: string,
    name_kana: string
}): Theater {
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
    }
}

export function createByCOA(theaterByCOA: COA.findTheaterInterface.Result): Theater {
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
    }
}