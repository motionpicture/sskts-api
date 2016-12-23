"use strict";
const mongoose = require("mongoose");
/**
 * 取引アイテムスキーマ
 */
exports.schema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    performance: {
        type: String,
        ref: 'Performance',
        required: true
    },
    seat_code: {
        type: String,
        required: true
    },
    status: {
        type: String,
    }
}, {
    collection: 'transaction_items',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
