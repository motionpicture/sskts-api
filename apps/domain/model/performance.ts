import Theater from "./theater";
import Screen from "./screen";
import Film from "./film";

export default class Performance {
    constructor(
        readonly _id: string,
        readonly theater: Theater,
        readonly screen: Screen,
        readonly film: Film,
        readonly day: string, // 上映日(※日付は西暦8桁 "YYYYMMDD")
        readonly time_start: string, // 上映開始時刻
        readonly time_end: string, // 上映終了時刻
        readonly canceled: boolean // 上映中止フラグ
        // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
        // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
        // kbn_acoustic: String, // 音響区分
        // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など　※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    ) {
        // TODO validation
    }
}