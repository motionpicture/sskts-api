import * as Screen from "../model/screen";
import Theater from "../model/theater";
import MultilingualString from "../model/multilingualString";
import COA = require("@motionpicture/coa-service");

export function create(args: {
    _id: string,
    theater: Theater,
    coa_screen_code: string,
    name: MultilingualString,
    sections: Array<Screen.Section>
}) {
    return new Screen.default(
        args._id,
        args.theater,
        args.coa_screen_code,
        args.name,
        args.sections,
    )
};

export function createFromCOA(screenFromCOA: COA.findScreensByTheaterCodeInterface.Result) {
    return async (theater: Theater) => {
        let sections: Array<{
            code: string,
            name: {
                ja: string,
                en: string,
            },
            seats: Array<{
                code: string
            }>
        }> = [];
        let sectionCodes: Array<string> = [];
        screenFromCOA.list_seat.forEach((seat) => {
            if (sectionCodes.indexOf(seat.seat_section) < 0) {
                sectionCodes.push(seat.seat_section);
                sections.push({
                    code: seat.seat_section,
                    name: {
                        ja: `セクション${seat.seat_section}`,
                        en: `section${seat.seat_section}`,
                    },
                    seats: []
                });
            }

            sections[sectionCodes.indexOf(seat.seat_section)].seats.push({
                code: seat.seat_num
            });
        });

        return create({
            _id: `${theater._id}${screenFromCOA.screen_code}`,
            theater: theater,
            coa_screen_code: screenFromCOA.screen_code,
            name: {
                ja: screenFromCOA.screen_name,
                en: screenFromCOA.screen_name_eng
            },
            sections: sections
        });
    }
}