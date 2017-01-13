import mongoose = require("mongoose");
import * as OwnerModel from "./owner";
import * as TransactionModel from "./transaction";

/** model name */
export const NAME = "Asset";

/**
 * 資産スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.NAME,
        required: true
    },
    transactions: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.NAME
        }
    ],

    group: Number, // 資産グループ
    price: Number, // 金額


},{
    collection: "assets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model(NAME, schema);
