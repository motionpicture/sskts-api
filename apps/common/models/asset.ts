import mongoose = require("mongoose");
import * as OwnerModel from "./owner";
import * as TransactionModel from "./transaction";

/** model name */
export var name = "Asset";

/**
 * 資産スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.name,
        required: true
    },
    transactions: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.name
        }
    ],

    group: String, // 資産グループ
    price: Number, // 金額


},{
    collection: "assets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(name, schema);

/** 座席予約グループ */
export var GROUP_SEAT_RESERVATION = "SEAT_RESERVATION";
