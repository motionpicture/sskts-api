import mongoose = require("mongoose");
import OwnerModel from "./owner";
import PerformanceModel from "./performance";

/**
 * 資産スキーマ
 */
let schema = new mongoose.Schema({
    _id: String,
    ownership: { // 所有権
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.modelName,
        },
        authenticated: Boolean,
    },
    authorizations: [mongoose.Schema.Types.Mixed], // 承認リスト
    group: String, // 資産グループ
    price: Number,


    performance: {
        type: String,
        ref: PerformanceModel.modelName
    },
    section: String,
    seat_code: String,
    ticket_code: String,
    ticket_name_ja: String,
    ticket_name_en: String,
    ticket_name_kana: String,
    std_price: Number,
    add_price: Number,
    dis_price: Number,
    sale_price: Number,


},{
    collection: "assets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Asset", schema);