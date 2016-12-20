import mongoose = require('mongoose');

/**
 * 劇場スキーマ
 */
export var schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    name_kana: String,
    address: {
        ja: String,
        en: String
    }
},{
    collection: 'theaters',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
