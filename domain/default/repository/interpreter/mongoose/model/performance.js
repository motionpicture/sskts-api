"use strict";
const mongoose = require("mongoose");
const theater_1 = require("./theater");
const screen_1 = require("./screen");
const film_1 = require("./film");
let schema = new mongoose.Schema({
    _id: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName,
    },
    theater_name: {
        ja: String,
        en: String,
    },
    screen: {
        type: String,
        ref: screen_1.default.modelName,
    },
    screen_name: {
        ja: String,
        en: String,
    },
    film: {
        type: String,
        ref: film_1.default.modelName,
    },
    film_name: {
        ja: String,
        en: String,
    },
    day: String,
    time_start: String,
    time_end: String,
    canceled: Boolean
}, {
    collection: "performances",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
schema.index({
    day: 1,
    time_start: 1
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Performance", schema);
