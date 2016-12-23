"use strict";
const mongoose = require("mongoose");
/**
 * 取引スキーマ
 */
exports.schema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    expired_at: {
        type: Date,
        required: true
    },
    status: {
        type: String,
    }
}, {
    collection: 'transactions',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
