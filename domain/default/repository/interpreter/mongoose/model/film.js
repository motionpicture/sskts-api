"use strict";
const mongoose = require("mongoose");
const theater_1 = require("./theater");
let schema = new mongoose.Schema({
    _id: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName,
    },
    name: {
        ja: String,
        en: String
    },
    name_kana: String,
    name_short: String,
    name_original: String,
    minutes: Number,
    date_start: String,
    date_end: String,
    kbn_eirin: String,
    kbn_eizou: String,
    kbn_joueihousiki: String,
    kbn_jimakufukikae: String,
    copyright: String,
    coa_title_code: String,
    coa_title_branch_num: String,
}, {
    collection: "films",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Film", schema);
