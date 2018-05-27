/**
 * ユーザールーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as AWS from 'aws-sdk';
import * as createDebug from 'debug';
import { Router } from 'express';
import { ACCEPTED, BAD_REQUEST, CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const peopleRouter = Router();

const debug = createDebug('sskts-api:routes:people');
const CUSTOM_ATTRIBUTE_NAME = <string>process.env.COGNITO_ATTRIBUTE_NAME_ACCOUNT_NUMBERS;
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1',
    credentials: new AWS.Credentials({
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
            const contact = await sskts.service.person.contact.retrieve(req.accessToken)();
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
            await sskts.service.person.contact.update(
                req.accessToken,
                {
                    givenName: req.body.givenName,
                    familyName: req.body.familyName,
                    email: req.body.email,
                    telephone: req.body.telephone
                }
            )();
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
            const searchCardResults = await sskts.service.person.creditCard.find(req.user.sub, <string>req.user.username)();
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
            const creditCard = await sskts.service.person.creditCard.save(
                req.user.sub,
                <string>req.user.username,
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
    permitScopes(['aws.cognito.signin.user.admin', 'people.creditCards']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.person.creditCard.unsubscribe(req.user.sub, req.params.cardSeq)();

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
            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            const account = await accountService.open({
                name: req.body.name
            });
            await addPecorinoAccountNumber(<string>req.user.username, account.accountNumber);
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
            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            await accountService.close({ accountNumber: req.params.accountNumber });
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
            await removePecorinoAccountNumber(<string>req.user.username, req.params.accountNumber);
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
            if (req.user.username === undefined) {
                throw new sskts.factory.errors.Forbidden('Login required');
            }

            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            let accounts: sskts.factory.pecorino.account.IAccount[] = [];
            const accountNumbers = await getAccountNumbers(req.user.username);
            if (accountNumbers.length > 0) {
                accounts = await accountService.search({
                    accountNumbers: accountNumbers,
                    statuses: [],
                    limit: 100
                });
            }

            // 互換性維持のため、idを口座番号に置換
            accounts = accounts.map((a) => {
                return { ...a, id: a.accountNumber };
            });
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
            const accountService = new sskts.pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoAuthClient
            });
            const actions = await accountService.searchMoneyTransferActions({ accountNumber: req.params.accountNumber });
            res.json(actions);
        } catch (error) {
            next(error);
        }
    }
);

async function addPecorinoAccountNumber(username: string, accountNumber: string) {
    const accountNumbers = await getAccountNumbers(username);
    debug('currently accountNumbers are', accountNumbers);

    accountNumbers.push(accountNumber);

    await new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminUpdateUserAttributes(
            {
                UserPoolId: <string>process.env.COGNITO_USER_POOL_ID,
                Username: username,
                UserAttributes: [
                    {
                        Name: `custom:${CUSTOM_ATTRIBUTE_NAME}`,
                        Value: JSON.stringify(accountNumbers)
                    }
                ]
            },
            (err) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
    debug('accountNumber added.', accountNumbers);
}

async function removePecorinoAccountNumber(username: string, accountNumber: string) {
    const accountNumbers = await getAccountNumbers(username);
    debug('currently accountNumbers are', accountNumbers);

    // 口座番号が存在すれば削除
    const accountNumberIndex = accountNumber.indexOf(accountNumber);
    if (accountNumberIndex >= 0) {
        accountNumbers.splice(accountNumberIndex, 1);
    }

    await new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminUpdateUserAttributes(
            {
                UserPoolId: <string>process.env.COGNITO_USER_POOL_ID,
                Username: username,
                UserAttributes: [
                    {
                        Name: `custom:${CUSTOM_ATTRIBUTE_NAME}`,
                        Value: JSON.stringify(accountNumbers)
                    }
                ]
            },
            (err) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
    debug('accountNumber added.', accountNumbers);
}

async function getAccountNumbers(username: string) {
    return new Promise<string[]>((resolve, reject) => {
        cognitoIdentityServiceProvider.adminGetUser(
            {
                UserPoolId: <string>process.env.COGNITO_USER_POOL_ID,
                Username: username
            },
            (err, data) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    if (data.UserAttributes === undefined) {
                        reject(new Error('UserAttributes not found.'));
                    } else {
                        const attribute = data.UserAttributes.find((a) => a.Name === `custom:${CUSTOM_ATTRIBUTE_NAME}`);
                        resolve((attribute !== undefined && attribute.Value !== undefined) ? JSON.parse(attribute.Value) : []);
                    }
                }
            });
    });
}

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
                ownedBy: req.user.sub,
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
peopleRouter.post(
    '/me/ownershipInfos/programMembership/register',
    permitScopes(['aws.cognito.signin.user.admin', 'people.ownershipInfos', 'people.ownershipInfos.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const task = await sskts.service.programMembership.createRegisterTask({
                userId: req.user.sub,
                username: <string>req.user.username,
                userPoolId: <string>process.env.COGNITO_USER_POOL_ID,
                programMembershipId: req.body.programMembershipId,
                offerIdentifier: req.body.offerIdentifier,
                sellerType: req.body.sellerType,
                sellerId: req.body.sellerId
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
