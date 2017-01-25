import Film from "../model/film";
import Theater from "../model/theater";
import MultilingualString from "../model/multilingualString";
import COA = require("@motionpicture/coa-service");

export function create(args: {
    _id: string,
    coa_title_code: string,
    coa_title_branch_num: string,
    theater: Theater,
    name: MultilingualString,
    name_kana: string, // 作品タイトル名（カナ）
    name_short: string, // 作品タイトル名省略
    name_original: string, // 原題
    minutes: number, // 上映時間
    date_start: string, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
    date_end: string, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
    kbn_eirin?: string,
    kbn_eizou?: string,
    kbn_joueihousiki?: string,
    kbn_jimakufukikae?: string
}) {
    return new Film(
        args._id,
        args.coa_title_code,
        args.coa_title_branch_num,
        args.theater,
        args.name,
        args.name_kana, // 作品タイトル名（カナ）
        args.name_short, // 作品タイトル名省略
        args.name_original, // 原題
        args.minutes, // 上映時間
        args.date_start, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        args.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        (args.kbn_eirin === undefined) ? "" : args.kbn_eirin,
        (args.kbn_eizou === undefined) ? "" : args.kbn_eizou,
        (args.kbn_joueihousiki === undefined) ? "" : args.kbn_joueihousiki,
        (args.kbn_jimakufukikae === undefined) ? "" : args.kbn_jimakufukikae,
    )
};

export function createFromCOA(filmFromCOA: COA.findFilmsByTheaterCodeInterface.Result) {
    return async (theater: Theater) => {
        return create({
            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
            _id: `${theater._id}${filmFromCOA.title_code}${filmFromCOA.title_branch_num}`,
            coa_title_code: filmFromCOA.title_code,
            coa_title_branch_num: filmFromCOA.title_branch_num,
            theater: theater,
            name: {
                ja: filmFromCOA.title_name,
                en: filmFromCOA.title_name_eng
            },
            name_kana: filmFromCOA.title_name_kana,
            name_short: filmFromCOA.title_name_short,
            name_original: filmFromCOA.title_name_orig,
            minutes: filmFromCOA.show_time,
            date_start: filmFromCOA.date_begin,
            date_end: filmFromCOA.date_end,
            kbn_eirin: filmFromCOA.kbn_eirin,
            kbn_eizou: filmFromCOA.kbn_eizou,
            kbn_joueihousiki: filmFromCOA.kbn_joueihousiki,
            kbn_jimakufukikae: filmFromCOA.kbn_jimakufukikae
        });
    }
}