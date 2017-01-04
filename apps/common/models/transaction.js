"use strict";
const mongoose = require("mongoose");
const OwnerModel = require("./owner");
const AuthorizationModel = require("./authorization");
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
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.name,
            required: true
        }],
    authorizations: [AuthorizationModel.schema] // 承認リスト
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
