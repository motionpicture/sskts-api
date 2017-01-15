import Film from "../model/Film";
import COA = require("@motionpicture/coa-service");

export function createByCOA(theaterCode: string, filmByCOA: COA.findFilmsByTheaterCodeInterface.Result): Film {
    return {
        // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
        _id: `${theaterCode}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
        coa_title_code: filmByCOA.title_code,
        coa_title_branch_num: filmByCOA.title_branch_num,
        theater: theaterCode,
        name: {
            ja: filmByCOA.title_name,
            en: filmByCOA.title_name_eng
        },
        name_kana: filmByCOA.title_name_kana, // 作品タイトル名（カナ）
        name_short: filmByCOA.title_name_short, // 作品タイトル名省略
        name_original: filmByCOA.title_name_orig, // 原題
        minutes: filmByCOA.show_time, // 上映時間
        date_start: filmByCOA.date_begin, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        date_end: filmByCOA.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        kbn_eirin: filmByCOA.kbn_eirin,
        kbn_eizou: filmByCOA.kbn_eizou,
        kbn_joueihousiki: filmByCOA.kbn_joueihousiki,
        kbn_jimakufukikae: filmByCOA.kbn_jimakufukikae,
    }
}