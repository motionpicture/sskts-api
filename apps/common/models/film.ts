import mongoose = require("mongoose");
import * as theaterModel from "./theater";

/** model name */
export const NAME = "Film";

/**
 * 作品スキーマ
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
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    name_kana: String, // 作品タイトル名（カナ）
    name_short: String, // 作品タイトル名省略
    name_original: String, // 原題
    minutes: Number, // 上映時間
    date_start: String, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
    date_end: String, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
    kbn_eirin: String, // 映倫区分(PG12,R15,R18)
    kbn_eizou: String, // 映像区分(２D、３D)
    kbn_joueihousiki: String, // 上映方式区分(ＩＭＡＸ，４ＤＸ等)
    kbn_jimakufukikae: String, // 字幕吹替区分(字幕、吹き替え)
    copyright: String, // コピーライト
    coa_title_code: {
        type: String,
        required: true
    },
    coa_title_branch_num: {
        type: String,
        required: true
    },
},{
    collection: "films",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(NAME, schema);
