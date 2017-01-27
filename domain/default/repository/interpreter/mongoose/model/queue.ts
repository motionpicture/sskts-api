import mongoose = require("mongoose");

/**
 * キュースキーマ
 */
let schema = new mongoose.Schema({
    group: String,
    authorization: mongoose.Schema.Types.Mixed,
    email: mongoose.Schema.Types.Mixed,
    status: String,
    transaction_id: mongoose.Schema.Types.ObjectId, // 取引期限切れに利用
    executed_at: Date,
},{
    collection: "queues",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Queue", schema);