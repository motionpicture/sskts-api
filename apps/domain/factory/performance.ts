import Performance from "../model/Performance";
import Screen from "../model/Screen";
import Theater from "../model/Theater";
import COA = require("@motionpicture/coa-service");

export function createByCOA(performanceByCOA: COA.findPerformancesByTheaterCodeInterface.Result, screen: Screen, theater: Theater): Performance {
    let id = `${theater._id}${performanceByCOA.date_jouei}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}${performanceByCOA.screen_code}${performanceByCOA.time_begin}`;
    let screenCode = `${theater._id}${performanceByCOA.screen_code}`;
    let filmCode = `${theater._id}${performanceByCOA.title_code}${performanceByCOA.title_branch_num}`;

    // 劇場とスクリーン名称を追加
    // TODO 存在check?
    // let _screen = screens.find((screen) => {
    //     return (screen.get("_id").toString() === screenCode);
    // });
    // if (!_screen) return reject("no screen.");

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
    }
}