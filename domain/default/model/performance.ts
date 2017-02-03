import Theater from "./theater";
import Screen from "./screen";
import Film from "./film";

/**
 * パフォーマンス
 * 
 * @export
 * @class Performance
 */
export default class Performance {
    /**
     * Creates an instance of Performance.
     * 
     * @param {string} _id
     * @param {Theater} theater 劇場
     * @param {Screen} screen スクリーン
     * @param {Film} film 作品
     * @param {string} day 上映日(※日付は西暦8桁 "YYYYMMDD")
     * @param {string} time_start 上映開始時刻
     * @param {string} time_end 上映終了時刻
     * @param {boolean} canceled 上映中止フラグ
     * 
     * @memberOf Performance
     */
    constructor(
        readonly _id: string,
        readonly theater: Theater,
        readonly screen: Screen,
        readonly film: Film,
        readonly day: string,
        readonly time_start: string,
        readonly time_end: string,
        readonly canceled: boolean
        // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
        // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
        // kbn_acoustic: String, // 音響区分
        // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など　※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    ) {
        // TODO validation
    }
}