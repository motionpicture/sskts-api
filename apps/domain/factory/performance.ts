import Performace from "../model/performance";
import Theater from "../model/theater";
import Screen from "../model/screen";
import Film from "../model/film";

export function create(args: {
    _id: string,
    theater: Theater,
    screen: Screen,
    film: Film,
    day: string, // 上映日(※日付は西暦8桁 "YYYYMMDD")
    time_start: string, // 上映開始時刻
    time_end: string, // 上映終了時刻
    canceled: boolean // 上映中止フラグ
    // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
    // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
    // kbn_acoustic: String, // 音響区分
    // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など　※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)

}) {
    return new Performace(
        args._id,
        args.theater,
        args.screen,
        args.film,
        args.day,
        args.time_start,
        args.time_end,
        args.canceled,
    );
}