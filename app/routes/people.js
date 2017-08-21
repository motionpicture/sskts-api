"use strict";
/**
 * people router
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
const sskts = require("@motionpicture/sskts-domain");
const AWS = require("aws-sdk");
const createDebug = require("debug");
const express_1 = require("express");
const httpStatus = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const requireMember_1 = require("../middlewares/requireMember");
const validator_1 = require("../middlewares/validator");
const peopleRouter = express_1.Router();
const debug = createDebug('sskts-api:routes:people');
peopleRouter.use(authentication_1.default);
peopleRouter.use(requireMember_1.default);
/**
 * retrieve contacts from Amazon Cognito
 */
peopleRouter.get('/me/contacts', permitScopes_1.default(['people.contacts', 'people.contacts.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            apiVersion: 'latest',
            region: 'ap-northeast-1'
        });
        cognitoIdentityServiceProvider.getUser({
            AccessToken: req.accessToken
        }, (err, data) => {
            if (err instanceof Error) {
                next(err);
            }
            else {
                const contacts = {
                    givenName: data.UserAttributes.find((attribute) => attribute.Name === 'given_name'),
                    familyName: data.UserAttributes.find((attribute) => attribute.Name === 'family_name'),
                    telephone: data.UserAttributes.find((attribute) => attribute.Name === 'phone_number')
                };
                res.json({
                    data: contacts
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プロフィール更新
 */
peopleRouter.put('/me/contacts', permitScopes_1.default(['people.contacts']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            apiVersion: 'latest',
            region: 'ap-northeast-1'
        });
        cognitoIdentityServiceProvider.updateUserAttributes({
            AccessToken: req.accessToken,
            UserAttributes: [
                {
                    Name: 'given_name',
                    Value: req.body.givenName
                },
                {
                    Name: 'family_name',
                    Value: req.body.familyName
                },
                {
                    Name: 'phone_number',
                    Value: req.body.telephone
                }
            ]
        }, (err) => {
            if (err instanceof Error) {
                next(err);
            }
            else {
                res.status(httpStatus.NO_CONTENT).end();
            }
        });
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
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        const personDoc = yield personAdapter.personModel.findById(req.user.person.id, 'givenName familyName').exec();
        if (personDoc === null) {
            throw new Error('person not found');
        }
        let searchCardResults;
        try {
            // まずGMO会員登録
            const gmoMember = yield sskts.GMO.services.card.searchMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: req.user.person.id
            });
            if (gmoMember === null) {
                const saveMemberResult = yield sskts.GMO.services.card.saveMember({
                    siteId: process.env.GMO_SITE_ID,
                    sitePass: process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id,
                    memberName: `${personDoc.get('familyName')} ${personDoc.get('givenName')}`
                });
                debug('GMO saveMember processed', saveMemberResult);
            }
            searchCardResults = yield sskts.GMO.services.card.searchCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: req.user.person.id,
                seqMode: sskts.GMO.utils.util.SeqMode.Physics
            });
        }
        catch (error) {
            throw new Error(error.errors[0].content);
        }
        res.json({
            data: searchCardResults
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード追加
 */
peopleRouter.post('/me/creditCards', permitScopes_1.default(['people.creditCards']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personAdapter = yield sskts.adapter.person(sskts.mongoose.connection);
        const personDoc = yield personAdapter.personModel.findById(req.user.person.id, 'givenName familyName').exec();
        if (personDoc === null) {
            throw new Error('person not found');
        }
        // GMOカード登録
        let creditCard;
        try {
            // まずGMO会員登録
            const gmoMember = yield sskts.GMO.services.card.searchMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: req.user.person.id
            });
            if (gmoMember === null) {
                const saveMemberResult = yield sskts.GMO.services.card.saveMember({
                    siteId: process.env.GMO_SITE_ID,
                    sitePass: process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id,
                    memberName: `${personDoc.get('familyName')} ${personDoc.get('givenName')}`
                });
                debug('GMO saveMember processed', saveMemberResult);
            }
            debug('saving a card to GMO...');
            const saveCardResult = yield sskts.GMO.services.card.saveCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: req.user.person.id,
                seqMode: sskts.GMO.utils.util.SeqMode.Physics,
                cardNo: req.body.cardNo,
                cardPass: req.body.cardPass,
                expire: req.body.expire,
                holderName: req.body.holderName,
                token: req.body.token
            });
            debug('card saved', saveCardResult);
            const searchCardResults = yield sskts.GMO.services.card.searchCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: req.user.person.id,
                seqMode: sskts.GMO.utils.util.SeqMode.Physics,
                cardSeq: saveCardResult.cardSeq
            });
            creditCard = searchCardResults[0];
        }
        catch (error) {
            throw new Error(error.errors[0].content);
        }
        res.status(httpStatus.CREATED).json({
            data: creditCard
        });
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
