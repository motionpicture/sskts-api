import mongoose = require("mongoose");
import * as OwnerModel from "./owner";

/** model name */
export const NAME = "Transaction";

/**
 * 取引スキーマ
 */
export var schema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    expired_at: {
        type: Date,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.NAME,
        required: true
    }],
    access_id: String, // 照会ID
    access_pass: String, // 照会PASS
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(NAME, schema);

export const enum STATUS {
    /** 進行中 */
    PROCESSING = 0,
    /** 成立済み */
    CLOSED = 1,
    /** 期限切れ */
    EXPIRED = 2,
    /** 取消済み */
    CANCELED = 3,
}
