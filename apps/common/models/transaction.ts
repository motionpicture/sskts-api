import mongoose = require('mongoose');

/**
 * 取引スキーマ
 */
export var schema = new mongoose.Schema({
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
},{
    collection: 'transactions',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

/** 進行中 */
export var STATUS_PROCSSING = "PROCESSING";
/** 同意待ち */
export var STATUS_WAITING_SINGED = "WAITING_SINGED";
/** 同意済み */
export var STATUS_SIGNED = "SIGNED";
/** 期限切れ */
export var STATUS_EXPIRED = "EXPIRED";
