import mongoose = require("mongoose");

/**
 * キュースキーマ
 */
let schema = new mongoose.Schema({
    group: String,
    status: String,
    transaction_id: mongoose.Schema.Types.ObjectId, // 取引期限切れに利用
    executed_at: Date,
    count_try: Number,

    authorization: mongoose.Schema.Types.Mixed, // オーソリタスク
    notification: mongoose.Schema.Types.Mixed, // 通知タスク
},{
    collection: "queues",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Queue", schema);