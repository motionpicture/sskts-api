import Film from "../model/Film";
import COA = require("@motionpicture/coa-service");

export function createByCOA(theaterCode: string, filmByCOA: COA.findFilmsByTheaterCodeInterface.Result): Film {
    return new Film(
        // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
        `${theaterCode}${filmByCOA.title_code}${filmByCOA.title_branch_num}`,
        filmByCOA.title_code,
        filmByCOA.title_branch_num,
        theaterCode,
        {
            ja: filmByCOA.title_name,
            en: filmByCOA.title_name_eng
        },
        filmByCOA.title_name_kana, // 作品タイトル名（カナ）
        filmByCOA.title_name_short, // 作品タイトル名省略
        filmByCOA.title_name_orig, // 原題
        filmByCOA.show_time, // 上映時間
        filmByCOA.date_begin, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        filmByCOA.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        filmByCOA.kbn_eirin,
        filmByCOA.kbn_eizou,
        filmByCOA.kbn_joueihousiki,
        filmByCOA.kbn_jimakufukikae
    );
}