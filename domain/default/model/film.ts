import Theater from "./theater";
import MultilingualString from "./multilingualString";

/**
 * 作品
 * 
 * @export
 * @class Film
 */
export default class Film {
    /**
     * Creates an instance of Film.
     * 
     * @param {string} _id
     * @param {string} coa_title_code COA作品コード
     * @param {string} coa_title_branch_num COA作品枝番
     * @param {Theater} theater 劇場
     * @param {MultilingualString} name 名称
     * @param {string} name_kana 作品タイトル名（カナ）
     * @param {string} name_short 作品タイトル名省略
     * @param {string} name_original 原題
     * @param {number} minutes 上映時間
     * @param {string} date_start 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
     * @param {string} date_end 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
     * @param {string} kbn_eirin 映倫区分
     * @param {string} kbn_eizou 映像区分
     * @param {string} kbn_joueihousiki 上映方式区分
     * @param {string} kbn_jimakufukikae 字幕吹替区分
     */
    constructor(
        readonly _id: string,
        readonly coa_title_code: string,
        readonly coa_title_branch_num: string,
        readonly theater: Theater,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly name_short: string,
        readonly name_original: string,
        readonly minutes: number,
        readonly date_start: string,
        readonly date_end: string,
        readonly kbn_eirin: string,
        readonly kbn_eizou: string,
        readonly kbn_joueihousiki: string,
        readonly kbn_jimakufukikae: string
    ) {
        // TODO validation
    }
}