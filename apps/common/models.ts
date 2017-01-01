import mongoose = require('mongoose');

import * as filmModel from './models/film';
import * as performanceModel from './models/performance';
import * as screenModel from './models/screen';
import * as theaterModel from './models/theater';
import * as assetModel from './models/asset';
import * as authorizationModel from './models/authorization';
import * as ownerModel from './models/owner';
import * as transactionModel from './models/transaction';

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


export var film = mongoose.model(filmModel.name, filmModel.schema);
export var performance = mongoose.model(performanceModel.name, performanceModel.schema);
export var screen = mongoose.model(screenModel.name, screenModel.schema);
export var theater = mongoose.model(theaterModel.name, theaterModel.schema);
export var asset = mongoose.model(assetModel.name, assetModel.schema);
export var authorization = mongoose.model(authorizationModel.name, authorizationModel.schema);
export var owner = mongoose.model(ownerModel.name, ownerModel.schema);
export var transaction = mongoose.model(transactionModel.name, transactionModel.schema);
