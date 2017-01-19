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

export function createByCOA(theaterByCOA: COA.findTheaterInterface.Result): Theater {
    return new Theater(
        theaterByCOA.theater_code,
        {
            ja: theaterByCOA.theater_name,
            en: theaterByCOA.theater_name_eng,
        },
        theaterByCOA.theater_name_kana,
        {
            ja: "",
            en: "",
        }
    );
}