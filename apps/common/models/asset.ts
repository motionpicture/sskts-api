import mongoose = require("mongoose");
import * as OwnerModel from "./owner";
import * as TransactionModel from "./transaction";

/**
 * 資産スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.default.modelName,
        required: true
    },
    transactions: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.default.modelName,
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

export default mongoose.model("Asset", schema);
