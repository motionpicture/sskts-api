import mongoose = require("mongoose");
import * as OwnerModel from "./owner";

/** model name */
export var name = "Transaction";

/**
 * 取引スキーマ
 */
export var schema = new mongoose.Schema({
    password: String,
    expired_at: Date,
    status: String,
    payment_no: String,
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    }]
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(name, schema);

/** 進行中 */
export var STATUS_PROCSSING = "PROCESSING";
/** 成立済み */
export var STATUS_CLOSED = "CLOSED";
/** 期限切れ */
export var STATUS_EXPIRED = "EXPIRED";
/** 取消済み */
export var STATUS_CANCELED = "CANCELED";
