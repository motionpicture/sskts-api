"use strict";
const Screen_1 = require("../model/Screen");
function createByCOA(theaterCode, screenByCOA) {
    let sections = [];
    let sectionCodes = [];
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
    return new Screen_1.default(`${theaterCode}${screenByCOA.screen_code}`, theaterCode, screenByCOA.screen_code, {
        ja: screenByCOA.screen_name,
        en: screenByCOA.screen_name_eng
    }, sections);
}
exports.createByCOA = createByCOA;
