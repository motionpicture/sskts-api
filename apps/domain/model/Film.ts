import Theater from "./Theater";
import MultilingualString from "./MultilingualString";

export default class Film {
    constructor(
        readonly _id: string,
        readonly coa_title_code: string,
        readonly coa_title_branch_num: string,
        readonly theater: Theater,
        readonly name: MultilingualString,
        readonly name_kana: string, // 作品タイトル名（カナ）
        readonly name_short: string, // 作品タイトル名省略
        readonly name_original: string, // 原題
        readonly minutes: number, // 上映時間
        readonly date_start: string, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        readonly date_end: string, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        readonly kbn_eirin: string,
        readonly kbn_eizou: string,
        readonly kbn_joueihousiki: string,
        readonly kbn_jimakufukikae: string
    ) {
        // TODO validation
    }
}