"use strict";
const mongoose = require("mongoose");
/** model name */
exports.name = "Owner";
/**
 * 所有者スキーマ
 */
exports.schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: String,
    email: String,
    tel: String,
}, {
    collection: 'owners',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
/** 匿名グループ */
exports.GROUP_ANONYMOUS = "ANONYMOUS";
/** 会員グループ */
exports.GROUP_MEMBER = "MEMBER";
