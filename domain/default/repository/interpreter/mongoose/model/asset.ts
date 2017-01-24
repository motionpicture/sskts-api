import mongoose = require("mongoose");
import OwnerModel from "./owner";
import TransactionModel from "./transaction";

/**
 * 資産スキーマ
 */
let schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
        required: true
    },
    transactions: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.modelName,
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
