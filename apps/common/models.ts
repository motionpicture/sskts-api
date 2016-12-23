import mongoose = require('mongoose');

import * as filmModel from './models/film';
import * as performanceModel from './models/performance';
import * as screenModel from './models/screen';
import * as theaterModel from './models/theater';
import * as transactionModel from './models/transaction';
import * as transactionItemModel from './models/transactionItem';

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


export var film = mongoose.model('Film', filmModel.schema);
export var performance = mongoose.model('Performance', performanceModel.schema);
export var screen = mongoose.model('Screen', screenModel.schema);
export var theater = mongoose.model('Theater', theaterModel.schema);
export var transaction = mongoose.model('Transaction', transactionModel.schema);
export var transactionItem = mongoose.model('TransactionItem', transactionItemModel.schema);
