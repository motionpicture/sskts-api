/**
 * `人物ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const peopleRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
// import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:routes:people');

peopleRouter.use(authentication);
// peopleRouter.use(requireMember);

/**
 * 会員プロフィール取得
 */
peopleRouter.get(
    '/me/profile',
    permitScopes(['people.profile', 'people.profile.read-only']),
    async (req, res, next) => {
        try {
            const personAdapter = await sskts.adapter.person(sskts.mongoose.connection);
            const personDoc = await personAdapter.personModel.findById(
                req.user.person.id,
                'typeOf givenName familyName email telephone'
            ).exec();
            debug('profile found', personDoc);

            if (personDoc === null) {
                res.status(httpStatus.NOT_FOUND).json({
                    data: null
                });
            } else {
                res.json({
                    data: personDoc.toObject()
                });

            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員プロフィール更新
 */
peopleRouter.put(
    '/me/profile',
    permitScopes(['people.profile']),
    (__1, __2, next) => {

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const personAdapter = await sskts.adapter.person(sskts.mongoose.connection);
            await personAdapter.personModel.findByIdAndUpdate(
                req.user.person.id,
                {
                    givenName: req.body.givenName,
                    familyName: req.body.familyName,
                    telephone: req.body.telephone
                }
            ).exec();

            res.status(httpStatus.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード取得
 */
peopleRouter.get(
    '/me/creditCards',
    permitScopes(['people.creditCards', 'people.creditCards.read-only']),
    async (req, res, next) => {
        try {
            const personAdapter = await sskts.adapter.person(sskts.mongoose.connection);
            const personDoc = await personAdapter.personModel.findById(
                req.user.person.id,
                'givenName familyName'
            ).exec();

            if (personDoc === null) {
                throw new Error('person not found');
            }

            let searchCardResults: sskts.GMO.services.card.ISearchCardResult[];
            try {
                // まずGMO会員登録
                const gmoMember = await sskts.GMO.services.card.searchMember({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id
                });
                if (gmoMember === null) {
                    const saveMemberResult = await sskts.GMO.services.card.saveMember({
                        siteId: <string>process.env.GMO_SITE_ID,
                        sitePass: <string>process.env.GMO_SITE_PASS,
                        memberId: req.user.person.id,
                        memberName: `${personDoc.get('familyName')} ${personDoc.get('givenName')}`
                    });
                    debug('GMO saveMember processed', saveMemberResult);
                }

                searchCardResults = await sskts.GMO.services.card.searchCard({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id,
                    seqMode: sskts.GMO.utils.util.SeqMode.Physics
                });
            } catch (error) {
                throw new Error(error.errors[0].content);
            }

            res.json({
                data: searchCardResults
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード追加
 */
peopleRouter.post(
    '/me/creditCards',
    permitScopes(['people.creditCards']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const personAdapter = await sskts.adapter.person(sskts.mongoose.connection);
            const personDoc = await personAdapter.personModel.findById(
                req.user.person.id,
                'givenName familyName'
            ).exec();

            if (personDoc === null) {
                throw new Error('person not found');
            }

            // GMOカード登録
            let creditCard: sskts.GMO.services.card.ISearchCardResult;
            try {
                // まずGMO会員登録
                const gmoMember = await sskts.GMO.services.card.searchMember({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id
                });
                if (gmoMember === null) {
                    const saveMemberResult = await sskts.GMO.services.card.saveMember({
                        siteId: <string>process.env.GMO_SITE_ID,
                        sitePass: <string>process.env.GMO_SITE_PASS,
                        memberId: req.user.person.id,
                        memberName: `${personDoc.get('familyName')} ${personDoc.get('givenName')}`
                    });
                    debug('GMO saveMember processed', saveMemberResult);
                }

                debug('saving a card to GMO...');
                const saveCardResult = await sskts.GMO.services.card.saveCard({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id,
                    seqMode: sskts.GMO.utils.util.SeqMode.Physics,
                    cardNo: req.body.cardNo,
                    cardPass: req.body.cardPass,
                    expire: req.body.expire,
                    holderName: req.body.holderName,
                    token: req.body.token
                });
                debug('card saved', saveCardResult);

                const searchCardResults = await sskts.GMO.services.card.searchCard({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: req.user.person.id,
                    seqMode: sskts.GMO.utils.util.SeqMode.Physics,
                    cardSeq: saveCardResult.cardSeq
                });

                creditCard = searchCardResults[0];
            } catch (error) {
                throw new Error(error.errors[0].content);
            }

            res.status(httpStatus.CREATED).json({
                data: {
                    typeOf: 'CreditCard',
                    cardSeq: creditCard.cardSeq,
                    cardName: creditCard.cardName,
                    cardNo: creditCard.cardNo,
                    expire: creditCard.expire,
                    holderName: creditCard.holderName
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

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

export default peopleRouter;
