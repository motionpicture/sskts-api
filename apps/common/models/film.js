"use strict";
const mongoose = require("mongoose");
const theaterModel = require("./theater");
exports.name = "Film";
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
    kbn_eirin: String,
    kbn_eizou: String,
    kbn_joueihousiki: String,
    kbn_jimakufukikae: String,
    copyright: String,
    coa_title_code: {
        type: String,
        required: true
    },
    coa_title_branch_num: {
        type: String,
        required: true
    },
}, {
    collection: "films",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
