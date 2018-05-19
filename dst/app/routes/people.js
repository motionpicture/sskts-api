"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ユーザールーター
 */
const sskts = require("@motionpicture/sskts-domain");
const AWS = require("aws-sdk");
const createDebug = require("debug");
const express_1 = require("express");
const http_status_1 = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const requireMember_1 = require("../middlewares/requireMember");
const validator_1 = require("../middlewares/validator");
const peopleRouter = express_1.Router();
const debug = createDebug('sskts-api:routes:people');
const CUSTOM_ATTRIBUTE_NAME = process.env.COGNITO_ATTRIBUTE_NAME_ACCOUNT_NUMBERS;
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1',
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
});
const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
    domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.PECORINO_API_CLIENT_ID,
    clientSecret: process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});
peopleRouter.use(authentication_1.default);
peopleRouter.use(requireMember_1.default);
/**
 * 連絡先検索
 */
peopleRouter.get('/me/contacts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.contacts', 'people.contacts.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const contact = yield sskts.service.person.contact.retrieve(req.accessToken)();
        res.json(contact);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プロフィール更新
 */
peopleRouter.put('/me/contacts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.contacts']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.person.contact.update(req.accessToken, {
            givenName: req.body.givenName,
            familyName: req.body.familyName,
            email: req.body.email,
            telephone: req.body.telephone
        })();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード検索
 */
peopleRouter.get('/me/creditCards', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards', 'people.creditCards.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const searchCardResults = yield sskts.service.person.creditCard.find(req.user.sub, req.user.username)();
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
peopleRouter.post('/me/creditCards', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const creditCard = yield sskts.service.person.creditCard.save(req.user.sub, req.user.username, req.body)();
        res.status(http_status_1.CREATED).json(creditCard);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード削除
 */
peopleRouter.delete('/me/creditCards/:cardSeq', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.person.creditCard.unsubscribe(req.user.sub, req.params.cardSeq)();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino口座開設
 */
peopleRouter.post('/me/accounts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        let account = yield accountService.open({
            name: req.body.name,
            initialBalance: 0
        });
        yield addPecorinoAccountNumber(req.user.username, account.accountNumber);
        // 互換性維持のため、idを口座番号に置換
        account = Object.assign({}, account, { id: account.accountNumber });
        res.status(http_status_1.CREATED).json(account);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino口座検索
 */
peopleRouter.get('/me/accounts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        if (req.user.username === undefined) {
            throw new sskts.factory.errors.Forbidden('Login required');
        }
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        let accounts = [];
        const accountNumbers = yield getAccountNumbers(req.user.username);
        if (accountNumbers.length > 0) {
            accounts = yield accountService.search({
                accountNumbers: accountNumbers,
                statuses: [],
                limit: 100
            });
        }
        // 互換性維持のため、idを口座番号に置換
        accounts = accounts.map((a) => {
            return Object.assign({}, a, { id: a.accountNumber });
        });
        res.json(accounts);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino取引履歴検索
 */
peopleRouter.get('/me/accounts/:accountNumber/actions/moneyTransfer', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts.actions.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        const actions = yield accountService.searchMoneyTransferActions({ accountNumber: req.params.accountNumber });
        res.json(actions);
    }
    catch (error) {
        next(error);
    }
}));
function addPecorinoAccountNumber(username, accountNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountNumbers = yield getAccountNumbers(username);
        debug('currently accountNumbers are', accountNumbers);
        accountNumbers.push(accountNumber);
        yield new Promise((resolve, reject) => {
            cognitoIdentityServiceProvider.adminUpdateUserAttributes({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: username,
                UserAttributes: [
                    {
                        Name: `custom:${CUSTOM_ATTRIBUTE_NAME}`,
                        Value: JSON.stringify(accountNumbers)
                    }
                ]
            }, (err) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
        debug('accountNumber added.', accountNumbers);
    });
}
function getAccountNumbers(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            cognitoIdentityServiceProvider.adminGetUser({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: username
            }, (err, data) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    if (data.UserAttributes === undefined) {
                        reject(new Error('UserAttributes not found.'));
                    }
                    else {
                        const attribute = data.UserAttributes.find((a) => a.Name === `custom:${CUSTOM_ATTRIBUTE_NAME}`);
                        resolve((attribute !== undefined && attribute.Value !== undefined) ? JSON.parse(attribute.Value) : []);
                    }
                }
            });
        });
    });
}
/**
 * ユーザーの所有権検索
 */
peopleRouter.get('/me/ownershipInfos/:goodType', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.ownershipInfos', 'people.ownershipInfos.read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const ownershipInfos = yield repository.search({
            goodType: req.params.goodType,
            ownedBy: req.user.sub,
            ownedAt: new Date()
        });
        res.json(ownershipInfos);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = peopleRouter;
