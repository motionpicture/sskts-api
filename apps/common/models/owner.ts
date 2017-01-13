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
