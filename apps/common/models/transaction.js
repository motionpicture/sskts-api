"use strict";
const mongoose = require("mongoose");
/** model name */
exports.name = "Transaction";
/**
 * 取引スキーマ
 */
exports.schema = new mongoose.Schema({
    password: String,
    expired_at: Date,
    status: String,
    payment_no: String,
}, {
    collection: 'transactions',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
/** 進行中 */
exports.STATUS_PROCSSING = "PROCESSING";
/** 成立済み */
exports.STATUS_CLOSED = "CLOSED";
/** 期限切れ */
exports.STATUS_EXPIRED = "EXPIRED";
