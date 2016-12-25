import mongoose = require('mongoose');

/**
 * タスクキュースキーマ
 */
export var schema = new mongoose.Schema({
    task: { // タスク名
        type: String,
        required: true
    },
    executed_at: { // 実行予定日時
        type: String,
        required: true
    },
    status: { // UNPROCESSED|PROCESSING|PROCESSED
        type: String,
        required: true
    }
},{
    collection: 'task_queues',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
