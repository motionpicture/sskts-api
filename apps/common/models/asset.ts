import mongoose = require('mongoose');
import * as ownerModel from './owner';
import * as authorizationModel from './authorization';
import * as performanceModel from './performance';

/** model name */
export var name = "Asset";

/**
 * 資産スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: ownerModel.name,
        required: true
    },
    authorizations: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: authorizationModel.name
        }
    ],

    payment_no: String, // 購入番号
    group: String, // 資産グループ
    amount: Number, // 金額

    performance: {
        type: String,
        ref: performanceModel.name,
    },
    section: String, // 座席セクション
    seat_code: String, // 座席コード
    ticket_type_code: String, // 券種
},{
    collection: 'assets',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
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
