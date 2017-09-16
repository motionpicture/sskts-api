"use strict";
/**
 * people router
 * @module peopleRouter
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
const google_libphonenumber_1 = require("google-libphonenumber");
const http_status_1 = require("http-status");
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
                debug('cognito getUserResponse:', data);
                const keysTable = {
                    given_name: 'givenName',
                    family_name: 'familyName',
                    email: 'email',
                    phone_number: 'telephone'
                };
                const contacts = data.UserAttributes.reduce((obj, item) => {
                    if (keysTable[item.Name] !== undefined) {
                        obj[keysTable[item.Name]] = item.Value;
                    }
                    return obj;
                }, {});
                // format a phone number to a Japanese style
                if (contacts.telephone !== undefined) {
                    const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
                    const phoneNumber = phoneUtil.parse(contacts.telephone, 'JP');
                    contacts.telephone = phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.NATIONAL);
                }
                res.json(contacts);
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
        const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
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
                    Value: phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.E164)
                },
                {
                    Name: 'email',
                    Value: req.body.email
                }
            ]
        }, (err) => {
            if (err instanceof Error) {
                next(new sskts.factory.errors.Argument('contact', err.message));
            }
            else {
                res.status(http_status_1.NO_CONTENT).end();
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード取得
 */
peopleRouter.get('/me/creditCards', permitScopes_1.default(['people.creditCards', 'people.creditCards.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const searchCardResults = yield sskts.service.person.creditCard.find(req.getUser().sub, req.getUser().username)();
        debug('searchCardResults:', searchCardResults);
        res.json(searchCardResults);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード追加
 */
peopleRouter.post('/me/creditCards', permitScopes_1.default(['people.creditCards']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const creditCard = yield sskts.service.person.creditCard.save(req.getUser().sub, req.getUser().username, req.body)();
        res.status(http_status_1.CREATED).json(creditCard);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード削除
 */
peopleRouter.delete('/me/creditCards/:cardSeq', permitScopes_1.default(['people.creditCards']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.person.creditCard.unsubscribe(req.getUser().sub, req.params.cardSeq)();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * find user's reservation ownershipInfos
 */
peopleRouter.get('/me/ownershipInfos/reservation', permitScopes_1.default(['people.ownershipInfos', 'people.ownershipInfos.read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const ownershipInfos = yield repository.searchScreeningEventReservation({
            ownedBy: req.getUser().sub,
            ownedAt: new Date()
        });
        res.json(ownershipInfos);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = peopleRouter;
