import MultilingualString from "./MultilingualString";

interface Film {
    _id: string,
    coa_title_code: string,
    coa_title_branch_num: string,
    theater: string,
    name: MultilingualString,
    name_kana: string, // 作品タイトル名（カナ）
    name_short: string, // 作品タイトル名省略
    name_original: string, // 原題
    minutes: number, // 上映時間
    date_start: string, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
    date_end: string, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
    kbn_eirin: string,
    kbn_eizou: string,
    kbn_joueihousiki: string,
    kbn_jimakufukikae: string,
}

export default Film;