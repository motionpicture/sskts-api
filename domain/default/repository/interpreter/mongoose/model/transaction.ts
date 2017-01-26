import mongoose = require("mongoose");
import OwnerModel from "./owner";

/**
 * 取引スキーマ
 */
let schema = new mongoose.Schema({
    expired_at: Date,
    status: String,
    events: [mongoose.Schema.Types.Mixed], // イベントリスト
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
    }],
    authorizations: [mongoose.Schema.Types.Mixed], // 資産承認リスト
    emails: [mongoose.Schema.Types.Mixed],
    queues: [mongoose.Schema.Types.Mixed],
    inquiry_id: String, // 照会ID
    inquiry_pass: String, // 照会PASS
    queues_status: String,
}, {
    collection: "transactions",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Transaction", schema);