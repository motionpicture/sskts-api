import Theater from "../model/theater";
import MultilingualString from "../model/multilingualString";
import COA = require("@motionpicture/coa-service");

export function create(args: {
    _id: string,
    name: MultilingualString,
    name_kana: string,
    address: MultilingualString,
}): Theater {
    return {
        _id: args._id,
        name: args.name,
        name_kana: args.name_kana,
        address: args.address,
    }
}

export function createFromCOA(theaterFromCOA: COA.findTheaterInterface.Result): Theater {
    return create({
        _id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng,
        },
        name_kana: theaterFromCOA.theater_name_kana,
        address: {
            ja: "",
            en: "",
        }
    });
}