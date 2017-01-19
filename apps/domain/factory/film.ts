import Film from "../model/film";
import Theater from "../model/theater";
import MultilingualString from "../model/multilingualString";

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