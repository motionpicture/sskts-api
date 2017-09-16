/**
 * people router
 * @module peopleRouter
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as AWS from 'aws-sdk';
import * as createDebug from 'debug';
import { Router } from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { CREATED, NO_CONTENT } from 'http-status';

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

                        res.json(contacts);
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
                next(new sskts.factory.errors.Argument('telephone', 'invalid phone number format'));

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
                        next(new sskts.factory.errors.Argument('contact', err.message));
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
 * 会員クレジットカード取得
 */
peopleRouter.get(
    '/me/creditCards',
    permitScopes(['people.creditCards', 'people.creditCards.read-only']),
    async (req, res, next) => {
        try {
            const searchCardResults = await sskts.service.person.creditCard.find(req.getUser().sub, <string>req.getUser().username)();
            debug('searchCardResults:', searchCardResults);

            res.json(searchCardResults);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員クレジットカード追加
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
            const creditCard = await sskts.service.person.creditCard.save(
                req.getUser().sub,
                <string>req.getUser().username,
                req.body
            )();

            res.status(CREATED).json(creditCard);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員クレジットカード削除
 */
peopleRouter.delete(
    '/me/creditCards/:cardSeq',
    permitScopes(['people.creditCards']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.person.creditCard.unsubscribe(req.getUser().sub, req.params.cardSeq)();

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

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
            const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const ownershipInfos = await repository.searchScreeningEventReservation({
                ownedBy: req.getUser().sub,
                ownedAt: new Date()
            });

            res.json(ownershipInfos);
        } catch (error) {
            next(error);
        }
    }
);

export default peopleRouter;
