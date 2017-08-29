/**
 * people router
 * @module peopleRouter
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as AWS from 'aws-sdk';
import * as createDebug from 'debug';
import { Router } from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { BAD_REQUEST, CREATED, NO_CONTENT } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

import { APIError } from '../error/api';

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
                        debug('cognito getUserResponse:', data);
                        const keysTable: any = {
                            given_name: 'givenName',
                            family_name: 'familyName',
                            email: 'email',
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

                        // format a phone number to a Japanese style
                        if (contacts.telephone !== undefined) {
                            const phoneUtil = PhoneNumberUtil.getInstance();
                            const phoneNumber = phoneUtil.parse(contacts.telephone, 'JP');
                            contacts.telephone = phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
                        }

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
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP');
            debug('isValidNumber:', phoneUtil.isValidNumber(phoneNumber));
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                next(new APIError(BAD_REQUEST, [{
                    title: 'BadRequest',
                    detail: 'invalid phone number format'
                }]));

                return;
            }

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
                            Value: phoneUtil.format(phoneNumber, PhoneNumberFormat.E164)
                        },
                        {
                            Name: 'email',
                            Value: req.body.email
                        }
                    ]
                },
                (err) => {
                    if (err instanceof Error) {
                        next(new APIError(BAD_REQUEST, [{
                            title: 'BadRequest',
                            detail: err.message
                        }]));
                    } else {
                        res.status(NO_CONTENT).end();
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
                    memberId: memberId,
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
                    memberId: memberId,
                    seqMode: sskts.GMO.utils.util.SeqMode.Physics,
                    cardSeq: saveCardResult.cardSeq
                });

                creditCard = searchCardResults[0];
            } catch (error) {
                throw new Error(error.errors[0].content);
            }

            res.status(CREATED).json({
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
 * find user's reservation ownershipInfos
 */
peopleRouter.get(
    '/me/ownershipInfos/reservation',
    permitScopes(['people.ownershipInfos', 'people.ownershipInfos.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const personId = req.getUser().sub;
            const ownershipInfoAdapter = sskts.adapter.ownershipInfo(sskts.mongoose.connection);
            const data = await ownershipInfoAdapter.ownershipInfoModel.find({
                'ownedBy.id': personId
            }).sort({ ownedFrom: 1 })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            res.json({
                data: data
            });
        } catch (error) {
            next(error);
        }
    }
);

export default peopleRouter;
