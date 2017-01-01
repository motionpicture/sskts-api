import mongoose = require('mongoose');

/** model name */
export var name = "Owner";

/**
 * 所有者スキーマ
 */
export var schema = new mongoose.Schema({
},{
    collection: 'owners',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
