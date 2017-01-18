import mongoose = require("mongoose");
import OwnerModel from "./owner";

/**
 * 取引スキーマ
 */
let schema = new mongoose.Schema({
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
    events: [],
    owners: [{ // 取引の対象所有者リスト
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
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

export default mongoose.model("Transaction", schema);
