import mongoose = require("mongoose");

/**
 * キュースキーマ
 */
let schema = new mongoose.Schema({
    group: String,
    status: String,
    /** 実行予定日時 */
    run_at: Date,
    /** 最大リトライ回数 */
    max_count_try: Number,
    /** 最終試行日時 */
    last_tried_at: Date,
    /** 試行回数 */
    count_tried: Number,
    /** 実行結果リスト */
    results: [String],

    authorization: mongoose.Schema.Types.Mixed, // オーソリタスク
    notification: mongoose.Schema.Types.Mixed, // 通知タスク
    transaction_id: mongoose.Schema.Types.ObjectId, // 取引タスク
}, {
        collection: "queues",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    });

export default mongoose.model("Queue", schema);