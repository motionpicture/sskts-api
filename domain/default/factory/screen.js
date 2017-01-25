"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Screen = require("../model/screen");
function create(args) {
    return new Screen.default(args._id, args.theater, args.coa_screen_code, args.name, args.sections);
}
exports.create = create;
;
function createFromCOA(screenFromCOA) {
    return (theater) => __awaiter(this, void 0, void 0, function* () {
        let sections = [];
        let sectionCodes = [];
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
    });
}
exports.createFromCOA = createFromCOA;
