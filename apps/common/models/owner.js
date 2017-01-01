"use strict";
const mongoose = require("mongoose");
/** model name */
exports.name = "Owner";
/**
 * 所有者スキーマ
 */
exports.schema = new mongoose.Schema({}, {
    collection: 'owners',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
