"use strict";
const Performance_1 = require("../model/Performance");
function createByCOA(performanceByCOA, screen, theater) {
    let id = `${theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
    let screenCode = `${theater._id}${performanceByCOA.screen_code}`;
    let filmCode = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;
    return new Performance_1.default(id, screenCode, screen.name, theater._id, theater.name, filmCode, performanceByCOA.date_jouei, performanceByCOA.time_begin, performanceByCOA.time_end, false);
}
exports.createByCOA = createByCOA;
