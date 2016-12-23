import mongoose = require('mongoose');

/**
 * 取引アイテムスキーマ
 */
export var schema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    category: { // 取引アイテム区分
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
},{
    collection: 'transaction_items',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
