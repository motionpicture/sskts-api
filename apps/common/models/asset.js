"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
const TransactionModel = require("./transaction");
const PerformanceModel = require("./performance");
/** model name */
exports.name = "Asset";
/**
 * 資産スキーマ
 */
exports.schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    },
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.name
        }
    ],
    payment_no: String,
    group: String,
    price: Number,
    // GROUP_SEAT_RESERVATIONの場合の属性
    performance: {
        type: String,
        ref: PerformanceModel.name,
    },
    section: String,
    seat_code: String,
    ticket_code: String,
    ticket_name_ja: String,
    ticket_name_en: String,
    ticket_name_kana: String,
    std_price: Number,
    add_price: Number,
    dis_price: Number,
}, {
    collection: "assets",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
exports.schema.index({
    group: 1,
    performance: 1,
    section: 1,
    seat_code: 1,
}, {
    unique: true
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 座席予約グループ */
exports.GROUP_SEAT_RESERVATION = "SEAT_RESERVATION";
