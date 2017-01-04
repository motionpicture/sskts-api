import mongoose = require("mongoose");
import * as OwnerModel from "./owner";
import * as TransactionModel from "./transaction";
import * as PerformanceModel from "./performance";

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

    payment_no: String, // 購入番号
    group: String, // 資産グループ
    price: Number, // 金額



    // GROUP_SEAT_RESERVATIONの場合の属性
    performance: {
        type: String,
        ref: PerformanceModel.name,
    },
    section: String, // 座席セクション
    seat_code: String, // 座席コード
    ticket_code: String, // チケットコード
    ticket_name: String, // チケット名
    ticket_name_kana: String, // チケット名（カナ）
    ticket_name_eng: String, // チケット名（英）
    std_price: Number, // 標準単価
    add_price: Number, // 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金)
    dis_price: Number, // 割引額
},{
    collection: "assets",
    timestamps: { 
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});

schema.index(
    {
        group: 1,
        performance: 1,
        section: 1,
        seat_code: 1,
    },
    {
        unique: true
    }
);

export default mongoose.model(name, schema);

/** 座席予約グループ */
export var GROUP_SEAT_RESERVATION = "SEAT_RESERVATION";
