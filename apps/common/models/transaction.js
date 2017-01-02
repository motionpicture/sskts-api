"use strict";
const mongoose = require("mongoose");
const ownerModel = require("./owner");
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
    owners: [{
            type: String,
            ref: ownerModel.name,
            required: true
        }],
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 進行中 */
exports.STATUS_PROCSSING = "PROCESSING";
/** 成立済み */
exports.STATUS_CLOSED = "CLOSED";
/** 期限切れ */
exports.STATUS_EXPIRED = "EXPIRED";
