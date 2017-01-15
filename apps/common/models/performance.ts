import mongoose = require("mongoose");
import * as theaterModel from "./theater";
import * as screenModel from "./screen";
import * as filmModel from "./film";

/** model name */
export const NAME = "Performance";

/**
 * パフォーマンススキーマ
 */
export var schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    theater: { 
        type: String,
        ref: theaterModel.NAME,
        required: true
    },
    theater_name: {
        ja: String,
        en: String,
    },
    screen: { 
        type: String,
        ref: screenModel.NAME,
        required: true
    },
    screen_name: {
        ja: String,
        en: String,
    },
    film: { 
        type: String,
        ref: filmModel.NAME,
        required: true
    },
    film_name: {
        ja: String,
        en: String,
    },
    day: String, // 上映日(※日付は西暦8桁 "YYYYMMDD")
    // time_open: String, // 開演時刻
    time_start: String, // 上映開始時刻
    time_end: String, // 上映終了時刻
    // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
    // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
    // kbn_acoustic: String, // 音響区分
    // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など　※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    canceled: Boolean // 上映中止フラグ
},{
    collection: "performances",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

/** 開始文字列を表示形式で取得 */
// schema.virtual("start_str_ja").get(function() {
//     return `${this.day.substr(0, 4)}/${this.day.substr(4, 2)}/${this.day.substr(6)} 開場 ${this.open_time.substr(0, 2)}:${this.open_time.substr(2)} 開演 ${this.start_time.substr(0, 2)}:${this.start_time.substr(2)}`;
// });
// schema.virtual("start_str_en").get(function() {
//     let date = `${moment(`${this.day.substr(0, 4)}-${this.day.substr(4, 2)}-${this.day.substr(6)}T00:00:00+09:00`).format("MMMM DD, YYYY")}`;
//     return `Open: ${this.open_time.substr(0, 2)}:${this.open_time.substr(2)}/Start: ${this.start_time.substr(0, 2)}:${this.start_time.substr(2)} on ${date}`;
// });

/**
 * 空席ステータスを算出する
 * 
 * @param {string} reservationNumber 予約数
 */
/*
schema.methods.getSeatStatus = function(reservationNumber: number) {
    // 上映日当日過ぎていればG
    if (parseInt(this.day) < parseInt(moment().format("YYYYMMDD"))) return PerformanceUtil.SEAT_STATUS_G;

    // 残席0以下なら問答無用に×
    let availableSeatNum = this.screen.seats_number - reservationNumber;
    if (availableSeatNum <= 0) return PerformanceUtil.SEAT_STATUS_C;

    // 残席数よりステータスを算出
    let seatNum = 100 * availableSeatNum;
    if (PerformanceUtil.SEAT_STATUS_THRESHOLD_A * this.screen.seats_number < seatNum) return PerformanceUtil.SEAT_STATUS_A;
    if (PerformanceUtil.SEAT_STATUS_THRESHOLD_B * this.screen.seats_number < seatNum) return PerformanceUtil.SEAT_STATUS_B;

    return PerformanceUtil.SEAT_STATUS_C;
};
*/

schema.index(
    {
        day: 1,
        time_start: 1
    }
);

export default mongoose.model(NAME, schema);
