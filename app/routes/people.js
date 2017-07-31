"use strict";
/**
 * `人物ルーター
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const peopleRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const httpStatus = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
// import requireMember from '../middlewares/requireMember';
const validator_1 = require("../middlewares/validator");
const debug = createDebug('sskts-api:routes:people');
peopleRouter.use(authentication_1.default);
// peopleRouter.use(requireMember);
/**
 * 会員プロフィール取得
 */
peopleRouter.get('/me/profile', permitScopes_1.default(['people.profile', 'people.profile.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        const personDoc = yield personAdapter.personModel.findById(req.user.person.id, 'typeOf givenName familyName email telephone').exec();
        debug('profile found', personDoc);
        if (personDoc === null) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        }
        else {
            res.json({
                data: personDoc.toObject()
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プロフィール更新
 */
peopleRouter.put('/me/profile', permitScopes_1.default(['people.profile']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        yield personAdapter.personModel.findByIdAndUpdate(req.user.person.id, {
            givenName: req.body.givenName,
            familyName: req.body.familyName,
            telephone: req.body.telephone
        }).exec();
        res.status(httpStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード取得
 */
peopleRouter.get('/me/creditCards', permitScopes_1.default(['people.creditCards', 'people.creditCards.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // const ownerId = <string>req.getUser().owner;
        // const data = await sskts.service.member.findCards(ownerId)()
        //     .then((cards) => {
        //         return cards.map((card) => {
        //             return {
        //                 type: 'cards',
        //                 id: card.id.toString(),
        //                 attributes: { ...card, ...{ id: undefined } }
        //             };
        //         });
        //     });
        res.json({
            data: [
                {
                    typeOf: 'CreditCard',
                    id: '12345',
                    cardSeq: '0',
                    cardName: 'Visa',
                    cardNo: '*************111',
                    expire: '18/ 12',
                    holderName: 'Tetsu Yamazaki'
                }
            ]
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード追加
 */
peopleRouter.post('/me/creditCards', permitScopes_1.default(['people.creditCards']), (req, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(httpStatus.CREATED).json({
            data: {
                typeOf: 'CreditCard',
                id: '12345',
                cardSeq: '0',
                cardName: 'Visa',
                cardNo: '*************111',
                expire: '18/ 12',
                holderName: 'Tetsu Yamazaki'
            }
        });
        // const ownerId = <string>req.getUser().owner;
        // // 生のカード情報の場合
        // const card = sskts.factory.card.gmo.createUncheckedCardRaw(req.body.data.attributes);
        // const addedCard = await sskts.service.member.addCard(ownerId, card)();
        // res.status(CREATED).json({
        //     data: {
        //         type: 'cards',
        //         id: addedCard.id.toString(),
        //         attributes: { ...addedCard, ...{ id: undefined } }
        //     }
        // });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード削除
 */
// peopleRouter.delete(
//     '/me/cards/:id',
//     permitScopes(['people.cards']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             await sskts.service.member.removeCard(ownerId, req.params.id)();
//             res.status(NO_CONTENT).end();
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員座席予約資産取得
 */
// peopleRouter.get(
//     '/me/assets/seatReservation',
//     permitScopes(['people.assets', 'people.assets.read-only']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             const data = await sskts.service.member.findSeatReservationAssets(ownerId)(sskts.adapter.asset(sskts.mongoose.connection))
//                 .then((assets) => {
//                     return assets.map((asset) => {
//                         return {
//                             type: 'assets',
//                             id: asset.id,
//                             attributes: asset
//                         };
//                     });
//                 });
//             res.json({
//                 data: data
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );
exports.default = peopleRouter;
