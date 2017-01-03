import mongoose = require('mongoose');
import * as theaterModel from './theater';

/** model name */
export var name = "Screen";

/**
 * スクリーンスキーマ
 */
export var schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    theater: { 
        type: String,
        ref: theaterModel.name,
        required: true
    },
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    seats_number: Number, // 座席合計数
    seats_numbers_by_seat_grade: [{ // 座席グレードごとの座席数
        _id: false,
        seat_grade_code: String, // 座席グレードコード
        seats_number: Number
    }],
    sections: [
         {
             _id: false,
             code: String,
             name: {
                 ja: String,
                 en: String,
             },
             seats: [
                 {
                     _id: false,
                     code: String, // 座席コード
                     grade: {
                         code: String, // 座席グレードコード
                         name: {
                            ja: String, // 座席レベル名
                            en: String, // 座席レベル名(英語)
                         },
                         additional_charge: Number // 追加料金
                     }
                 },
             ]
        },
    ]
},{
    collection: 'screens',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

export default mongoose.model(name, schema);
