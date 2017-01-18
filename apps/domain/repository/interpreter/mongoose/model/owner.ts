import mongoose = require("mongoose");

/**
 * 所有者スキーマ
 */
let schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: String,
    email: String,
    tel: String,
},{
    collection: "owners",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Owner", schema);
