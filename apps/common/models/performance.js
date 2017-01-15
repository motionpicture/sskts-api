"use strict";
const mongoose = require("mongoose");
const theaterModel = require("./theater");
const screenModel = require("./screen");
const filmModel = require("./film");
exports.NAME = "Performance";
exports.schema = new mongoose.Schema({
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
exports.schema.index({
    day: 1,
    time_start: 1
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.NAME, exports.schema);
