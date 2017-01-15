import Screen from "../model/Screen";
import COA = require("@motionpicture/coa-service");

export function createByCOA(theaterCode: string, screenByCOA: COA.findScreensByTheaterCodeInterface.Result): Screen {
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
    screenByCOA.list_seat.forEach((seat) => {
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

    return {
        _id: `${theaterCode}${screenByCOA.screen_code}`,
        theater: theaterCode,
        coa_screen_code: screenByCOA.screen_code,
        name: {
            ja: screenByCOA.screen_name,
            en: screenByCOA.screen_name_eng
        },
        sections: sections
    }
}