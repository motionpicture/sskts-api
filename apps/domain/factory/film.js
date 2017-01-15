"use strict";
function createByCOA(theaterCode, filmByCOA) {
    return {
        _id: `${theaterCode}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
        coa_title_code: filmByCOA.title_code,
        coa_title_branch_num: filmByCOA.title_branch_num,
        theater: theaterCode,
        name: {
            ja: filmByCOA.title_name,
            en: filmByCOA.title_name_eng
        },
        name_kana: filmByCOA.title_name_kana,
        name_short: filmByCOA.title_name_short,
        name_original: filmByCOA.title_name_orig,
        minutes: filmByCOA.show_time,
        date_start: filmByCOA.date_begin,
        date_end: filmByCOA.date_end,
        kbn_eirin: filmByCOA.kbn_eirin,
        kbn_eizou: filmByCOA.kbn_eizou,
        kbn_joueihousiki: filmByCOA.kbn_joueihousiki,
        kbn_jimakufukikae: filmByCOA.kbn_jimakufukikae,
    };
}
exports.createByCOA = createByCOA;
