"use strict";
const performance_1 = require("../model/performance");
function create(args) {
    return new performance_1.default(args._id, args.theater, args.screen, args.film, args.day, args.time_start, args.time_end, args.canceled);
}
exports.create = create;
function createFromCOA(performanceFromCOA) {
    return (screen, film) => {
        return create({
            _id: `${screen.theater._id}${performanceFromCOA.date_jouei}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}${performanceFromCOA.screen_code}${performanceFromCOA.time_begin}`,
            theater: screen.theater,
            screen: screen,
            film: film,
            day: performanceFromCOA.date_jouei,
            time_start: performanceFromCOA.time_begin,
            time_end: performanceFromCOA.time_end,
            canceled: false,
        });
    };
}
exports.createFromCOA = createFromCOA;
