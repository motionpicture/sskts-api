"use strict";
const mongoose = require("mongoose");
const filmModel = require("./models/film");
const performanceModel = require("./models/performance");
const screenModel = require("./models/screen");
const theaterModel = require("./models/theater");
const transactionModel = require("./models/transaction");
const transactionItemModel = require("./models/transactionItem");
/**
 * 劇場とパフォーマンスの整合性を保つ
 * 劇場と予約の整合性を保つ
 */
// TheaterSchema.post('findOneAndUpdate', function(doc, next){
//     Models.Performance.update(
//         {
//             theater: doc['_id']
//         },
//         {
//             "theater_name.ja": doc["name"]["ja"],
//             "theater_name.en": doc["name"]["en"]
//         },
//         {multi: true},
//         (err, raw) => {
//             console.log('related performances updated.', err, raw);
//             Models.Reservation.update(
//                 {
//                     theater: doc['_id']
//                 },
//                 {
//                     theater_name_ja: doc["name"]["ja"],
//                     theater_name_en: doc["name"]["en"],
//                     theater_address_ja: doc["address"]["ja"],
//                     theater_address_en: doc["address"]["en"]
//                 },
//                 {multi: true},
//                 (err, raw) => {
//                     console.log('related reservations updated.', err, raw);
//                     next();
//                 }
//             );
//         }
//     );
// });
exports.film = mongoose.model('Film', filmModel.schema);
exports.performance = mongoose.model('Performance', performanceModel.schema);
exports.screen = mongoose.model('Screen', screenModel.schema);
exports.theater = mongoose.model('Theater', theaterModel.schema);
exports.transaction = mongoose.model('Transaction', transactionModel.schema);
exports.transactionItem = mongoose.model('TransactionItem', transactionItemModel.schema);
