"use strict";
const mongoose = require("mongoose");
/**
 * タスクキュースキーマ
 */
exports.schema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    executed_at: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    collection: 'task_queues',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
