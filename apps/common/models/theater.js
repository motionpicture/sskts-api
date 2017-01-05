"use strict";
const mongoose = require("mongoose");
/** model name */
exports.name = "Theater";
/**
 * 劇場スキーマ
 */
exports.schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: {
            ja: String,
            en: String
        },
        required: true
    },
    name_kana: String,
    address: {
        ja: String,
        en: String
    }
}, {
    collection: "theaters",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 劇場とパフォーマンスの整合性を保つ
 * 劇場と予約の整合性を保つ
 */
// schema.post("findOneAndUpdate", function(doc, next){
//     PerformanceModel.update(
//         {
//             theater: doc["_id"]
//         },
//         {
//             "theater_name.ja": doc["name"]["ja"],
//             "theater_name.en": doc["name"]["en"]
//         },
//         {multi: true},
//         (err, raw) => {
//             console.log("related performances updated.", err, raw);
//             ReservationModel.update(
//                 {
//                     theater: doc["_id"]
//                 },
//                 {
//                     theater_name_ja: doc["name"]["ja"],
//                     theater_name_en: doc["name"]["en"],
//                     theater_address_ja: doc["address"]["ja"],
//                     theater_address_en: doc["address"]["en"]
//                 },
//                 {multi: true},
//                 (err, raw) => {
//                     console.log("related reservations updated.", err, raw);
//                     next();
//                 }
//             );
//         }
//     );
// });
exports.default = mongoose.model(exports.name, exports.schema);
