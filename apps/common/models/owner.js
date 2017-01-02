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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
/** 運営者グループ */
exports.GROUP_ADMINISTRATOR = "ADMINISTRATOR";
/** 匿名グループ */
exports.GROUP_ANONYMOUS = "ANONYMOUS";
/** 会員グループ */
exports.GROUP_MEMBER = "MEMBER";
