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
