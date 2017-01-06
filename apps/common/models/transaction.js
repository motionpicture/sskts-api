"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
/** model name */
exports.name = "Transaction";
/**
 * 取引スキーマ
 */
exports.schema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    expired_at: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.name,
            required: true
        }],
    access_id: String,
    access_pass: String,
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
/** 取消済み */
exports.STATUS_CANCELED = "CANCELED";
