"use strict";
const mongoose = require("mongoose");
const theaterModel = require("./theater");
/** model name */
exports.name = "Screen";
/**
 * スクリーンスキーマ
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
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    seats_number: Number,
    seats_numbers_by_seat_grade: [{
            _id: false,
            seat_grade_code: String,
            seats_number: Number
        }],
    sections: [
        {
            _id: false,
            code: String,
            name: {
                ja: String,
                en: String,
            },
            seats: [
                {
                    _id: false,
                    code: String,
                    grade: {
                        code: String,
                        name: {
                            ja: String,
                            en: String,
                        },
                        additional_charge: Number // 追加料金
                    }
                },
            ]
        },
    ]
}, {
    collection: "screens",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
