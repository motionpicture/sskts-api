"use strict";
const mongoose = require("mongoose");
/**
 * 取引スキーマ
 */
exports.schema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    expired_at: {
        type: Date,
        required: true
    },
    status: {
        type: String,
    }
}, {
    collection: 'transactions',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
/** 進行中 */
exports.STATUS_PROCSSING = "PROCESSING";
/** 同意待ち */
exports.STATUS_WAITING_SINGED = "WAITING_SINGED";
/** 同意済み */
exports.STATUS_SIGNED = "SIGNED";
/** 期限切れ */
exports.STATUS_EXPIRED = "EXPIRED";
