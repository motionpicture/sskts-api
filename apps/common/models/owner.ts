import mongoose = require('mongoose');

/** model name */
export var name = "Owner";

/**
 * 所有者スキーマ
 */
export var schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: String,
    email: String,
    tel: String,
},{
    collection: 'owners',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

export default mongoose.model(name, schema);

/** 運営者グループ */
export var GROUP_ADMINISTRATOR = "ADMINISTRATOR";
/** 匿名グループ */
export var GROUP_ANONYMOUS = "ANONYMOUS";
/** 会員グループ */
export var GROUP_MEMBER = "MEMBER";
