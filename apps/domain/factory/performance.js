"use strict";
function createByCOA(performanceByCOA, screen, theater) {
    let id = `${theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
    let screenCode = `${theater._id}${performanceByCOA.screen_code}`;
    let filmCode = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;
    return {
        _id: id,
        screen: screenCode,
        screen_name: screen.name,
        theater: theater._id,
        theater_name: theater.name,
        film: filmCode,
        day: performanceByCOA.date_jouei,
        time_start: performanceByCOA.time_begin,
        time_end: performanceByCOA.time_end,
        canceled: false
    };
}
exports.createByCOA = createByCOA;
