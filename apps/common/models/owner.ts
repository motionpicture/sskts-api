import mongoose = require("mongoose");

/** model name */
export const NAME = "Owner";

/**
 * 所有者スキーマ
 */
export var schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: Number,
    email: String,
    tel: String,
},{
    collection: "owners",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(NAME, schema);

export const enum GROUP {
    /** 匿名グループ */
    ANONYMOUS = 0,
    /** 運営者グループ */
    ADMINISTRATOR = 1,
    /** 会員グループ */
    MEMBER = 2
}

/**
 * 利用可能なグループ名かどうか
 */
export function isAvailableGroup(group: number) {
    return (
           group === GROUP.ANONYMOUS
        || group === GROUP.ADMINISTRATOR
        || group === GROUP.MEMBER
    );
}