"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
const TransactionModel = require("./transaction");
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
    group: String,
    price: Number,
}, {
    collection: "assets",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 座席予約グループ */
exports.GROUP_SEAT_RESERVATION = "SEAT_RESERVATION";
