/**
 * ユーザールーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import { ACCEPTED, BAD_REQUEST, CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';
import * as moment from 'moment';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const peopleRouter = Router();

const debug = createDebug('sskts-api:routes:people');
const cognitoIdentityServiceProvider = new sskts.AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1',
    credentials: new sskts.AWS.Credentials({
        accessKeyId: <string>process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: <string>process.env.AWS_SECRET_ACCESS_KEY
    })
});
const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
    domain: <string>process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
    clientId: <string>process.env.PECORINO_API_CLIENT_ID,
    clientSecret: <string>process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});

peopleRouter.use(authentication);
peopleRouter.use(requireMember);

/**
 * 連絡先検索
 */
peopleRouter.get(
    '/me/contacts',
    permitScopes(['aws.cognito.signin.user.admin', 'people.contacts', 'people.contacts.read-only']),
    async (req, res, next) => {
        try {
            const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
            const contact = await personRepo.getUserAttributesByAccessToken(req.accessToken);
            res.json(contact);
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
    permitScopes(['aws.cognito.signin.user.admin', 'people.contacts']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
            await personRepo.updateContactByAccessToken({
                accessToken: req.accessToken,
                contact: {
                    givenName: req.body.givenName,
                    familyName: req.body.familyName,
                    email: req.body.email,
                    telephone: req.body.telephone
                }
            });
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員クレジットカード検索
 */
peopleRouter.get(
    '/me/creditCards',
    permitScopes(['aws.cognito.signin.user.admin', 'people.creditCards', 'people.creditCards.read-only']),
    async (req, res, next) => {
        try {
            const searchCardResults = await sskts.service.person.creditCard.find(<string>req.user.username)();
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
    permitScopes(['aws.cognito.signin.user.admin', 'people.creditCards']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const creditCard = await sskts.service.person.creditCard.save(<string>req.user.username, req.body)();
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
    permitScopes(['aws.cognito.signin.user.admin', 'people.creditCards']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.person.creditCard.unsubscribe(<string>req.user.username, req.params.cardSeq)();
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Pecorino口座開設
 */
peopleRouter.post(
    '/me/accounts',
    permitScopes(['aws.cognito.signin.user.admin', 'people.accounts']),
    (req, _, next) => {
        req.checkBody('name', 'invalid name').notEmpty().withMessage('name is required');
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const now = new Date();
            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            const account = await accountService.open({
                name: req.body.name
            });
            const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const ownershipInfo: sskts.factory.ownershipInfo.IOwnershipInfo<sskts.factory.pecorino.account.AccountType> = {
                typeOf: 'OwnershipInfo',
                // 十分にユニーク
                identifier: `${sskts.factory.pecorino.account.AccountType.Account}-${req.user.username}-${account.accountNumber}`,
                typeOfGood: {
                    typeOf: sskts.factory.pecorino.account.AccountType.Account,
                    accountNumber: account.accountNumber
                },
                ownedBy: req.agent,
                ownedFrom: now,
                // tslint:disable-next-line:no-magic-numbers
                ownedThrough: moment(now).add(100, 'years').toDate() // 十分に無期限
            };
            await ownershipInfoRepo.save(ownershipInfo);
            // await addPecorinoAccountNumber(<string>req.user.username, account.accountNumber);
            res.status(CREATED).json(account);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Pecorino口座解約
 * 口座の状態を変更するだけで、所有口座リストから削除はしない
 */
peopleRouter.put(
    '/me/accounts/:accountNumber/close',
    permitScopes(['aws.cognito.signin.user.admin', 'people.accounts']),
    validator,
    async (req, res, next) => {
        try {
            // 口座所有権を検索
            const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const accountOwnershipInfos = await ownershipInfoRepo.search({
                goodType: sskts.factory.pecorino.account.AccountType.Account,
                ownedBy: req.user.username
            });
            const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
            if (accountOwnershipInfo === undefined) {
                throw new sskts.factory.errors.NotFound('Account');
            }

            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            await accountService.close({ accountNumber: accountOwnershipInfo.typeOfGood.accountNumber });
            res.status(NO_CONTENT).end();
        } catch (error) {
            // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
            if (error.name === 'PecorinoRequestError') {
                // Pecorino APIのステータスコード4xxをハンドリング
                const message = `${error.name}:${error.message}`;
                switch (error.code) {
                    case BAD_REQUEST: // 400
                        error = new sskts.factory.errors.Argument('accountNumber', message);
                        break;
                    case UNAUTHORIZED: // 401
                        error = new sskts.factory.errors.Unauthorized(message);
                        break;
                    case FORBIDDEN: // 403
                        error = new sskts.factory.errors.Forbidden(message);
                        break;
                    case NOT_FOUND: // 404
                        error = new sskts.factory.errors.NotFound(message);
                        break;
                    case TOO_MANY_REQUESTS: // 429
                        error = new sskts.factory.errors.RateLimitExceeded(message);
                        break;
                    default:
                        error = new sskts.factory.errors.ServiceUnavailable(message);
                }
            }

            next(error);
        }
    }
);

/**
 * Pecorino口座削除
 */
peopleRouter.delete(
    '/me/accounts/:accountNumber',
    permitScopes(['aws.cognito.signin.user.admin', 'people.accounts']),
    validator,
    async (req, res, next) => {
        try {
            const now = new Date();
            // 口座所有権を検索
            const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const accountOwnershipInfos = await ownershipInfoRepo.search({
                goodType: sskts.factory.pecorino.account.AccountType.Account,
                ownedBy: req.user.username,
                ownedAt: now
            });
            const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
            if (accountOwnershipInfo === undefined) {
                throw new sskts.factory.errors.NotFound('Account');
            }

            // 所有期限を更新
            await ownershipInfoRepo.ownershipInfoModel.findOneAndUpdate(
                { identifier: accountOwnershipInfo.identifier },
                { ownedThrough: now }
            ).exec();
            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Pecorino口座検索
 */
peopleRouter.get(
    '/me/accounts',
    permitScopes(['aws.cognito.signin.user.admin', 'people.accounts.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const now = new Date();
            if (req.user.username === undefined) {
                throw new sskts.factory.errors.Forbidden('Login required');
            }

            // 口座所有権を検索
            const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const accountOwnershipInfos = await ownershipInfoRepo.search({
                goodType: sskts.factory.pecorino.account.AccountType.Account,
                ownedBy: req.user.username,
                ownedAt: now
            });
            let accounts: sskts.factory.pecorino.account.IAccount[] = [];
            if (accountOwnershipInfos.length > 0) {
                const accountService = new sskts.pecorinoapi.service.Account({
                    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    auth: pecorinoAuthClient
                });

                accounts = await accountService.search({
                    accountNumbers: accountOwnershipInfos.map((o) => o.typeOfGood.accountNumber),
                    statuses: [],
                    limit: 100
                });
            }
            res.json(accounts);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Pecorino取引履歴検索
 */
peopleRouter.get(
    '/me/accounts/:accountNumber/actions/moneyTransfer',
    permitScopes(['aws.cognito.signin.user.admin', 'people.accounts.actions.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const now = new Date();
            // 口座所有権を検索
            const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const accountOwnershipInfos = await ownershipInfoRepo.search({
                goodType: sskts.factory.pecorino.account.AccountType.Account,
                ownedBy: req.user.username,
                ownedAt: now
            });
            const accountOwnershipInfo = accountOwnershipInfos.find((o) => o.typeOfGood.accountNumber === req.params.accountNumber);
            if (accountOwnershipInfo === undefined) {
                throw new sskts.factory.errors.NotFound('Account');
            }

            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            const actions = await accountService.searchMoneyTransferActions({
                accountNumber: accountOwnershipInfo.typeOfGood.accountNumber
            });
            res.json(actions);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ユーザーの所有権検索
 */
peopleRouter.get(
    '/me/ownershipInfos/:goodType',
    permitScopes(['aws.cognito.signin.user.admin', 'people.ownershipInfos', 'people.ownershipInfos.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const ownershipInfos = await repository.search({
                goodType: req.params.goodType,
                ownedBy: req.user.username, // ユーザーネームで検索
                ownedAt: new Date()
            });
            res.json(ownershipInfos);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員プログラム登録
 */
peopleRouter.put(
    '/me/ownershipInfos/programMembership/register',
    permitScopes(['aws.cognito.signin.user.admin', 'people.ownershipInfos']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const task = await sskts.service.programMembership.createRegisterTask({
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
            res.status(ACCEPTED).json(task);
        } catch (error) {
            next(error);
        }
    }
);

export default peopleRouter;
