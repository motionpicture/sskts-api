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
 * me(今ログイン中のユーザー)ルーター
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const express_1 = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const authentication_1 = require("../../middlewares/authentication");
const permitScopes_1 = require("../../middlewares/permitScopes");
const requireMember_1 = require("../../middlewares/requireMember");
const validator_1 = require("../../middlewares/validator");
const redis = require("../../../redis");
const meRouter = express_1.Router();
const debug = createDebug('sskts-api:routes:people:me');
const cognitoIdentityServiceProvider = new sskts.AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1',
    credentials: new sskts.AWS.Credentials({
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
meRouter.use(authentication_1.default);
meRouter.use(requireMember_1.default); // 自分のリソースへのアクセスなので、もちろんログイン必須
/**
 * 連絡先検索
 */
meRouter.get('/contacts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.contacts', 'people.contacts.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const contact = yield personRepo.getUserAttributesByAccessToken(req.accessToken);
        res.json(contact);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プロフィール更新
 */
meRouter.put('/contacts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.contacts']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        yield personRepo.updateContactByAccessToken({
            accessToken: req.accessToken,
            contact: {
                givenName: req.body.givenName,
                familyName: req.body.familyName,
                email: req.body.email,
                telephone: req.body.telephone
            }
        });
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード検索
 */
meRouter.get('/creditCards', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards', 'people.creditCards.read-only']), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const searchCardResults = yield sskts.service.person.creditCard.find(req.user.username)();
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
meRouter.post('/creditCards', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const creditCard = yield sskts.service.person.creditCard.save(req.user.username, req.body)();
        res.status(http_status_1.CREATED).json(creditCard);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員クレジットカード削除
 */
meRouter.delete('/creditCards/:cardSeq', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.creditCards']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.person.creditCard.unsubscribe(req.user.username, req.params.cardSeq)();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino口座開設
 */
meRouter.post('/accounts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts']), (req, _, next) => {
    req.checkBody('name', 'invalid name').notEmpty().withMessage('name is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const now = new Date();
        const accountNumberRepo = new sskts.repository.AccountNumber(redis.getClient());
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        const account = yield sskts.service.account.open({
            name: req.body.name
        })({
            accountNumber: accountNumberRepo,
            accountService: accountService
        });
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const ownershipInfo = {
            typeOf: 'OwnershipInfo',
            // 十分にユニーク
            identifier: `${sskts.factory.pecorino.account.TypeOf.Account}-${req.user.username}-${account.accountNumber}`,
            typeOfGood: {
                typeOf: sskts.factory.pecorino.account.TypeOf.Account,
                accountType: sskts.factory.accountType.Point,
                accountNumber: account.accountNumber
            },
            ownedBy: req.agent,
            ownedFrom: now,
            // tslint:disable-next-line:no-magic-numbers
            ownedThrough: moment(now).add(100, 'years').toDate() // 十分に無期限
        };
        yield ownershipInfoRepo.save(ownershipInfo);
        res.status(http_status_1.CREATED).json(account);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino口座解約
 * 口座の状態を変更するだけで、所有口座リストから削除はしない
 */
meRouter.put('/accounts/:accountNumber/close', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 口座所有権を検索
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const accountOwnershipInfos = yield ownershipInfoRepo.search({
            goodType: sskts.factory.pecorino.account.TypeOf.Account,
            ownedBy: req.user.username
        });
        const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
        if (accountOwnershipInfo === undefined) {
            throw new sskts.factory.errors.NotFound('Account');
        }
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        yield accountService.close({
            accountType: sskts.factory.accountType.Point,
            accountNumber: accountOwnershipInfo.typeOfGood.accountNumber
        });
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
        if (error.name === 'PecorinoRequestError') {
            // Pecorino APIのステータスコード4xxをハンドリング
            const message = `${error.name}:${error.message}`;
            switch (error.code) {
                case http_status_1.BAD_REQUEST: // 400
                    error = new sskts.factory.errors.Argument('accountNumber', message);
                    break;
                case http_status_1.UNAUTHORIZED: // 401
                    error = new sskts.factory.errors.Unauthorized(message);
                    break;
                case http_status_1.FORBIDDEN: // 403
                    error = new sskts.factory.errors.Forbidden(message);
                    break;
                case http_status_1.NOT_FOUND: // 404
                    error = new sskts.factory.errors.NotFound(message);
                    break;
                case http_status_1.TOO_MANY_REQUESTS: // 429
                    error = new sskts.factory.errors.RateLimitExceeded(message);
                    break;
                default:
                    error = new sskts.factory.errors.ServiceUnavailable(message);
            }
        }
        next(error);
    }
}));
/**
 * Pecorino口座削除
 */
meRouter.delete('/accounts/:accountNumber', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const now = new Date();
        // 口座所有権を検索
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const accountOwnershipInfos = yield ownershipInfoRepo.search({
            goodType: sskts.factory.pecorino.account.TypeOf.Account,
            ownedBy: req.user.username,
            ownedAt: now
        });
        const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
        if (accountOwnershipInfo === undefined) {
            throw new sskts.factory.errors.NotFound('Account');
        }
        // 所有期限を更新
        yield ownershipInfoRepo.ownershipInfoModel.findOneAndUpdate({ identifier: accountOwnershipInfo.identifier }, { ownedThrough: now }).exec();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino口座検索
 */
meRouter.get('/accounts', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const now = new Date();
        if (req.user.username === undefined) {
            throw new sskts.factory.errors.Forbidden('Login required');
        }
        // 口座所有権を検索
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const accountOwnershipInfos = yield ownershipInfoRepo.search({
            goodType: sskts.factory.pecorino.account.TypeOf.Account,
            ownedBy: req.user.username,
            ownedAt: now
        });
        let accounts = [];
        if (accountOwnershipInfos.length > 0) {
            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            accounts = yield accountService.search({
                accountType: sskts.factory.accountType.Point,
                accountNumbers: accountOwnershipInfos.map((o) => o.typeOfGood.accountNumber),
                statuses: [],
                limit: 100
            });
        }
        res.json(accounts);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * Pecorino取引履歴検索
 */
meRouter.get('/accounts/:accountNumber/actions/moneyTransfer', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.accounts.actions.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const now = new Date();
        // 口座所有権を検索
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const accountOwnershipInfos = yield ownershipInfoRepo.search({
            goodType: sskts.factory.pecorino.account.TypeOf.Account,
            ownedBy: req.user.username,
            ownedAt: now
        });
        const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
        if (accountOwnershipInfo === undefined) {
            throw new sskts.factory.errors.NotFound('Account');
        }
        const accountService = new sskts.pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: pecorinoAuthClient
        });
        const actions = yield accountService.searchMoneyTransferActions({
            accountType: sskts.factory.accountType.Point,
            accountNumber: accountOwnershipInfo.typeOfGood.accountNumber
        });
        res.json(actions);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ユーザーの所有権検索
 */
meRouter.get('/ownershipInfos/:goodType', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.ownershipInfos', 'people.ownershipInfos.read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const ownershipInfos = yield repository.search({
            goodType: req.params.goodType,
            ownedBy: req.user.username,
            ownedAt: new Date()
        });
        res.json(ownershipInfos);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プログラム登録
 */
meRouter.put('/ownershipInfos/programMembership/register', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.ownershipInfos']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const task = yield sskts.service.programMembership.createRegisterTask({
            agent: req.agent,
            seller: {
                typeOf: req.body.sellerType,
                id: req.body.sellerId
            },
            programMembershipId: req.body.programMembershipId,
            offerIdentifier: req.body.offerIdentifier
        })({
            organization: new sskts.repository.Organization(sskts.mongoose.connection),
            programMembership: new sskts.repository.ProgramMembership(sskts.mongoose.connection),
            task: new sskts.repository.Task(sskts.mongoose.connection)
        });
        // 会員登録タスクとして受け入れられたのでACCEPTED
        res.status(http_status_1.ACCEPTED).json(task);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員プログラム登録解除
 * 所有権のidentifierをURLで指定
 */
meRouter.put('/ownershipInfos/programMembership/:identifier/unRegister', permitScopes_1.default(['aws.cognito.signin.user.admin', 'people.ownershipInfos']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const task = yield sskts.service.programMembership.createUnRegisterTask({
            agent: req.agent,
            ownershipInfoIdentifier: req.params.identifier
        })({
            ownershipInfo: new sskts.repository.OwnershipInfo(sskts.mongoose.connection),
            task: new sskts.repository.Task(sskts.mongoose.connection)
        });
        // 会員登録解除タスクとして受け入れられたのでACCEPTED
        res.status(http_status_1.ACCEPTED).json(task);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = meRouter;
