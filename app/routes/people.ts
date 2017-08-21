/**
 * people router
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as AWS from 'aws-sdk';
import * as createDebug from 'debug';
import { Router } from 'express';
import * as httpStatus from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const peopleRouter = Router();

const debug = createDebug('sskts-api:routes:people');

peopleRouter.use(authentication);
peopleRouter.use(requireMember);

/**
 * retrieve contacts from Amazon Cognito
 */
peopleRouter.get(
    '/me/contacts',
    permitScopes(['people.contacts', 'people.contacts.read-only']),
    async (req, res, next) => {
        try {
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: 'ap-northeast-1'
            });

            cognitoIdentityServiceProvider.getUser(
                {
                    AccessToken: req.accessToken
                },
                (err, data) => {
                    if (err instanceof Error) {
                        next(err);
                    } else {
                        const keysTable: any = {
                            given_name: 'givenName',
                            family_name: 'familyName',
                            phone_number: 'telephone'
                        };
                        const contacts: any = data.UserAttributes.reduce(
                            (obj, item) => {
                                if (keysTable[item.Name] !== undefined) {
                                    obj[keysTable[item.Name]] = item.Value;
                                }

                                return obj;
                            },
                            <any>{}
                        );

                        res.json({
                            data: contacts
                        });
                    }
                });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員プロフィール更新
 */
peopleRouter.put(
    '/me/contacts',
    permitScopes(['people.contacts']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: 'ap-northeast-1'
            });

            cognitoIdentityServiceProvider.updateUserAttributes(
                {
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
                },
                (err) => {
                    if (err instanceof Error) {
                        next(err);
                    } else {
                        res.status(httpStatus.NO_CONTENT).end();
                    }
                });
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
            let searchCardResults: sskts.GMO.services.card.ISearchCardResult[];
            try {
                // まずGMO会員登録
                const memberId = req.getUser().sub;
                const memberName = req.getUser().username;
                const gmoMember = await sskts.GMO.services.card.searchMember({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: memberId
                });
                if (gmoMember === null) {
                    const saveMemberResult = await sskts.GMO.services.card.saveMember({
                        siteId: <string>process.env.GMO_SITE_ID,
                        sitePass: <string>process.env.GMO_SITE_PASS,
                        memberId: memberId,
                        memberName: memberName
                    });
                    debug('GMO saveMember processed', saveMemberResult);
                }

                searchCardResults = await sskts.GMO.services.card.searchCard({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: memberId,
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
            // GMOカード登録
            let creditCard: sskts.GMO.services.card.ISearchCardResult;
            try {
                // まずGMO会員登録
                const memberId = req.getUser().sub;
                const memberName = req.getUser().username;
                const gmoMember = await sskts.GMO.services.card.searchMember({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: memberId
                });
                if (gmoMember === null) {
                    const saveMemberResult = await sskts.GMO.services.card.saveMember({
                        siteId: <string>process.env.GMO_SITE_ID,
                        sitePass: <string>process.env.GMO_SITE_PASS,
                        memberId: memberId,
                        memberName: memberName
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
                data: creditCard
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
