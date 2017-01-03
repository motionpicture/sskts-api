"use strict";
const mongoose = require("mongoose");
const theaterModel = require("./theater");
/** model name */
exports.name = "Film";
/**
 * 作品スキーマ
 */
exports.schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    theater: {
        type: String,
        ref: theaterModel.name,
        required: true
    },
    film_group: {
        type: String,
        required: true
    },
    film_branch_code: String,
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    name_kana: String,
    name_short: String,
    name_original: String,
    minutes: Number,
    date_start: String,
    date_end: String,
    // kbn_eirin: String, // 映倫区分(PG12,R15,R18)
    // kbn_eizou: String, // 映像区分(２D、３D)
    // kbn_joeihousiki: String, // 上映方式区分(ＩＭＡＸ，４ＤＸ等)
    // kbn_jimakufukikae: String, // 字幕吹替区分(字幕、吹き替え)
    copyright: String // コピーライト
}, {
    collection: 'films',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
