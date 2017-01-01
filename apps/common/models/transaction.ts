import mongoose = require('mongoose');

/** model name */
export var name = "Transaction";

/**
 * 取引スキーマ
 */
export var schema = new mongoose.Schema({
    password: String,
    expired_at: Date,
    status: String,
    payment_no: String,
},{
    collection: 'transactions',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

/** 進行中 */
export var STATUS_PROCSSING = "PROCESSING";
/** 成立済み */
export var STATUS_CLOSED = "CLOSED";
/** 期限切れ */
export var STATUS_EXPIRED = "EXPIRED";
