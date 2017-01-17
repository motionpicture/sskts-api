"use strict";
const Performance_1 = require("../model/Performance");
function createByCOA(performanceByCOA, screen, theater, film) {
    let id = `${theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
    return new Performance_1.default(id, theater, screen, film, performanceByCOA.date_jouei, performanceByCOA.time_begin, performanceByCOA.time_end, false);
}
exports.createByCOA = createByCOA;
