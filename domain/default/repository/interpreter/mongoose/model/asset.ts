import mongoose = require("mongoose");
import OwnerModel from "./owner";
import PerformanceModel from "./performance";

/**
 * 資産スキーマ
 */
let schema = new mongoose.Schema({
    _id: String,
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: OwnerModel.modelName,
        required: true
    },
    authorizations: [ // 承認リスト
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],

    group: String, // 資産グループ
    price: Number,
    performance: {
        type: String,
        ref: PerformanceModel.modelName
    },
    section: String,
    seat_code: String,
},{
    collection: "assets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

export default mongoose.model("Asset", schema);