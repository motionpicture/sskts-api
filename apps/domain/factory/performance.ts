import Performance from "../model/Performance";
import Screen from "../model/Screen";
import Theater from "../model/Theater";
import Film from "../model/Film";
import COA = require("@motionpicture/coa-service");

export function createByCOA(performanceByCOA: COA.findPerformancesByTheaterCodeInterface.Result, screen: Screen, theater: Theater, film: Film) {
    let id = `${theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
    // let screenCode = `${theater._id}${performanceByCOA.screen_code}`;
    // let filmCode = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;

    return new Performance(
        id,
        theater,
        screen,
        film,
        performanceByCOA.date_jouei,
        performanceByCOA.time_begin,
        performanceByCOA.time_end,
        false
    );
}