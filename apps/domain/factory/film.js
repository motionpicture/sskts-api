"use strict";
const Film_1 = require("../model/Film");
function createByCOA(theaterCode, filmByCOA) {
    return new Film_1.default(`${theaterCode}${filmByCOA.title_code}${filmByCOA.title_branch_num}`, filmByCOA.title_code, filmByCOA.title_branch_num, theaterCode, {
        ja: filmByCOA.title_name,
        en: filmByCOA.title_name_eng
    }, filmByCOA.title_name_kana, filmByCOA.title_name_short, filmByCOA.title_name_orig, filmByCOA.show_time, filmByCOA.date_begin, filmByCOA.date_end, filmByCOA.kbn_eirin, filmByCOA.kbn_eizou, filmByCOA.kbn_joueihousiki, filmByCOA.kbn_jimakufukikae);
}
exports.createByCOA = createByCOA;
