import mongoose = require("mongoose");
import OwnerModel from "./owner";

/**
 * 取引スキーマ
 */
let schema = new mongoose.Schema({
    expired_at: Date,
    status: String,
    events: [], // イベントリスト
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
    }],
    authorizations: [], // 資産承認リスト
    inquiry_id: String, // 照会ID
    inquiry_pass: String, // 照会PASS
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Transaction", schema);