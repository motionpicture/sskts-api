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
    (req, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
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
