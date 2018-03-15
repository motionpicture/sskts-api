/**
 * 注文取引ルーター
 * @ignore
 */

import * as middlewares from '@motionpicture/express-middleware';
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import { CREATED, NO_CONTENT, NOT_FOUND, TOO_MANY_REQUESTS } from 'http-status';
import * as redis from 'ioredis';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const placeOrderTransactionsRouter = Router();

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const debug = createDebug('sskts-api:placeOrderTransactionsRouter');

const pecorinoOAuth2client = new sskts.pecorinoapi.auth.OAuth2({
    domain: <string>process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN
});

// tslint:disable-next-line:no-magic-numbers
const AGGREGATION_UNIT_IN_SECONDS = parseInt(<string>process.env.TRANSACTION_RATE_LIMIT_AGGREGATION_UNIT_IN_SECONDS, 10);
// tslint:disable-next-line:no-magic-numbers
const THRESHOLD = parseInt(<string>process.env.TRANSACTION_RATE_LIMIT_THRESHOLD, 10);
/**
 * 進行中取引の接続回数制限ミドルウェア
 * 取引IDを使用して動的にスコープを作成する
 * @const
 */
const rateLimit4transactionInProgress =
    middlewares.rateLimit({
        redisClient: new redis({
            host: <string>process.env.RATE_LIMIT_REDIS_HOST,
            // tslint:disable-next-line:no-magic-numbers
            port: parseInt(<string>process.env.RATE_LIMIT_REDIS_PORT, 10),
            password: <string>process.env.RATE_LIMIT_REDIS_KEY,
            tls: <any>{ servername: <string>process.env.RATE_LIMIT_REDIS_HOST }
        }),
        aggregationUnitInSeconds: AGGREGATION_UNIT_IN_SECONDS,
        threshold: THRESHOLD,
        // 制限超過時の動作をカスタマイズ
        limitExceededHandler: (__0, __1, res, next) => {
            res.setHeader('Retry-After', AGGREGATION_UNIT_IN_SECONDS);
            const message = `Retry after ${AGGREGATION_UNIT_IN_SECONDS} seconds for your transaction.`;
            next(new sskts.factory.errors.RateLimitExceeded(message));
        },
        // スコープ生成ロジックをカスタマイズ
        scopeGenerator: (req) => `placeOrderTransaction.${req.params.transactionId}`
    });

placeOrderTransactionsRouter.use(authentication);

placeOrderTransactionsRouter.post(
    '/start',
    permitScopes(['transactions']),
    (req, _, next) => {
        // expires is unix timestamp (in seconds)
        req.checkBody('expires', 'invalid expires').notEmpty().withMessage('expires is required');
        req.checkBody('sellerId', 'invalid sellerId').notEmpty().withMessage('sellerId is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            let passportToken = req.body.passportToken;

            // 許可証トークンパラメーターがなければ、WAITERで許可証を取得
            if (passportToken === undefined) {
                const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
                const seller = await organizationRepo.findMovieTheaterById(req.body.sellerId);

                try {
                    passportToken = await request.post(
                        `${process.env.WAITER_ENDPOINT}/passports`,
                        {
                            body: {
                                scope: `placeOrderTransaction.${seller.identifier}`
                            },
                            json: true
                        }
                    ).then((body) => body.token);
                } catch (error) {
                    if (error.statusCode === NOT_FOUND) {
                        throw new sskts.factory.errors.NotFound('sellerId', 'Seller does not exist.');
                    } else if (error.statusCode === TOO_MANY_REQUESTS) {
                        throw new sskts.factory.errors.RateLimitExceeded('PlaceOrder transactions rate limit exceeded.');
                    } else {
                        throw new sskts.factory.errors.ServiceUnavailable('Waiter service temporarily unavailable.');
                    }
                }
            }

            // パラメーターの形式をunix timestampからISO 8601フォーマットに変更したため、互換性を維持するように期限をセット
            const expires = (/^\d+$/.test(req.body.expires))
                // tslint:disable-next-line:no-magic-numbers
                ? moment.unix(parseInt(req.body.expires, 10)).toDate()
                : moment(req.body.expires).toDate();
            const transaction = await sskts.service.transaction.placeOrderInProgress.start({
                expires: expires,
                agentId: req.user.sub,
                sellerId: req.body.sellerId,
                clientUser: req.user,
                passportToken: passportToken
            })({
                organization: new sskts.repository.Organization(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            // tslint:disable-next-line:no-string-literal
            // const host = req.headers['host'];
            // res.setHeader('Location', `https://${host}/transactions/${transaction.id}`);
            res.json(transaction);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 購入者情報を変更する
 */
placeOrderTransactionsRouter.put(
    '/:transactionId/customerContact',
    permitScopes(['transactions']),
    (req, _, next) => {
        req.checkBody('familyName').notEmpty().withMessage('required');
        req.checkBody('givenName').notEmpty().withMessage('required');
        req.checkBody('telephone').notEmpty().withMessage('required');
        req.checkBody('email').notEmpty().withMessage('required');

        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const contact = await sskts.service.transaction.placeOrderInProgress.setCustomerContact(
                req.user.sub,
                req.params.transactionId,
                {
                    familyName: req.body.familyName,
                    givenName: req.body.givenName,
                    email: req.body.email,
                    telephone: req.body.telephone
                }
            )({
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(CREATED).json(contact);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 座席仮予約
 */
placeOrderTransactionsRouter.post(
    '/:transactionId/actions/authorize/seatReservation',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const action = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
                req.user.sub,
                req.params.transactionId,
                req.body.eventIdentifier,
                req.body.offers
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection),
                event: new sskts.repository.Event(sskts.mongoose.connection)
            });

            res.status(CREATED).json(action);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 座席仮予約削除
 */
placeOrderTransactionsRouter.delete(
    '/:transactionId/actions/authorize/seatReservation/:actionId',
    permitScopes(['transactions']),
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.cancel(
                req.user.sub,
                req.params.transactionId,
                req.params.actionId
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 座席仮予へ変更(券種変更)
 */
placeOrderTransactionsRouter.patch(
    '/:transactionId/actions/authorize/seatReservation/:actionId',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const action = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
                req.user.sub,
                req.params.transactionId,
                req.params.actionId,
                req.body.eventIdentifier,
                req.body.offers
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection),
                event: new sskts.repository.Event(sskts.mongoose.connection)
            });

            res.json(action);
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:transactionId/actions/authorize/creditCard',
    permitScopes(['transactions']),
    (req, __2, next) => {
        req.checkBody('orderId', 'invalid orderId').notEmpty().withMessage('orderId is required');
        req.checkBody('amount', 'invalid amount').notEmpty().withMessage('amount is required');
        req.checkBody('method', 'invalid method').notEmpty().withMessage('gmo_order_id is required');
        req.checkBody('creditCard', 'invalid creditCard').notEmpty().withMessage('gmo_amount is required');

        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            // 会員IDを強制的にログイン中の人物IDに変更
            const creditCard: sskts.service.transaction.placeOrderInProgress.action.authorize.creditCard.ICreditCard4authorizeAction = {
                ...req.body.creditCard,
                ...{
                    memberId: (req.user.username !== undefined) ? req.user.sub : undefined
                }
            };
            debug('authorizing credit card...', creditCard);

            debug('authorizing credit card...', req.body.creditCard);
            const action = await sskts.service.transaction.placeOrderInProgress.action.authorize.creditCard.create(
                req.user.sub,
                req.params.transactionId,
                req.body.orderId,
                req.body.amount,
                req.body.method,
                creditCard
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection),
                organization: new sskts.repository.Organization(sskts.mongoose.connection)
            });

            res.status(CREATED).json({
                id: action.id
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * クレジットカードオーソリ取消
 */
placeOrderTransactionsRouter.delete(
    '/:transactionId/actions/authorize/creditCard/:actionId',
    permitScopes(['transactions']),
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.action.authorize.creditCard.cancel(
                req.user.sub,
                req.params.transactionId,
                req.params.actionId
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケ追加
 */
placeOrderTransactionsRouter.post(
    '/:transactionId/actions/authorize/mvtk',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const authorizeObject = {
                typeOf: sskts.factory.action.authorize.mvtk.ObjectType.Mvtk,
                // tslint:disable-next-line:no-magic-numbers
                price: parseInt(req.body.price, 10),
                transactionId: req.params.transactionId,
                seatInfoSyncIn: {
                    kgygishCd: req.body.seatInfoSyncIn.kgygishCd,
                    yykDvcTyp: req.body.seatInfoSyncIn.yykDvcTyp,
                    trkshFlg: req.body.seatInfoSyncIn.trkshFlg,
                    kgygishSstmZskyykNo: req.body.seatInfoSyncIn.kgygishSstmZskyykNo,
                    kgygishUsrZskyykNo: req.body.seatInfoSyncIn.kgygishUsrZskyykNo,
                    jeiDt: req.body.seatInfoSyncIn.jeiDt,
                    kijYmd: req.body.seatInfoSyncIn.kijYmd,
                    stCd: req.body.seatInfoSyncIn.stCd,
                    screnCd: req.body.seatInfoSyncIn.screnCd,
                    knyknrNoInfo: req.body.seatInfoSyncIn.knyknrNoInfo,
                    zskInfo: req.body.seatInfoSyncIn.zskInfo,
                    skhnCd: req.body.seatInfoSyncIn.skhnCd
                }
            };
            const action = await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.create(
                req.user.sub,
                req.params.transactionId,
                authorizeObject
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(CREATED).json({
                id: action.id
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケ取消
 */
placeOrderTransactionsRouter.delete(
    '/:transactionId/actions/authorize/mvtk/:actionId',
    permitScopes(['transactions']),
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.cancel(
                req.user.sub,
                req.params.transactionId,
                req.params.actionId
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * レストランメニューアイテム承認アクション
 */
placeOrderTransactionsRouter.post(
    '/:transactionId/actions/authorize/menuItem',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const action = await authorizeMenuItem(
                req.user.sub,
                req.params.transactionId,
                req.body.menuItemIdentifier,
                req.body.offerIdentifier
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(CREATED).json(action);
        } catch (error) {
            next(error);
        }
    }
);

function authorizeMenuItem(
    agentId: string,
    transactionId: string,
    menuItemIdentifier: string,
    offerIdentifier: string
): any {
    return async (repos: {
        action: sskts.repository.Action;
        transaction: sskts.repository.Transaction;
    }) => {
        const transaction = await repos.transaction.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new sskts.factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // メニューアイテムを取得？
        // const individualScreeningEvent = await repos.event.findIndividualScreeningEventByIdentifier(eventIdentifier);

        // 供給情報の有効性を確認？
        // const offersWithDetails = await validateOffers((transaction.agent.memberOf !== undefined), individualScreeningEvent, offers);

        // 承認アクションを開始
        debug('starting authorize action of menuItem...', menuItemIdentifier, offerIdentifier);
        const actionAttributes = {
            typeOf: sskts.factory.actionType.AuthorizeAction,
            object: {
                typeOf: 'Offer',
                identifier: 'offerIdentifier',
                price: 700,
                priceCurrency: 'JPY',
                itemOffered: {
                    identifier: 'menuItemIdentifier',
                    typeOf: 'MenuItem',
                    name: 'ビール',
                    description: ''
                }
            },
            agent: transaction.seller,
            recipient: transaction.agent,
            purpose: transaction // purposeは取引
        };
        const action = await repos.action.start(actionAttributes);

        try {
            // 在庫確保？
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await repos.action.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new sskts.factory.errors.ServiceUnavailable('Unexepected error occurred.');
        }

        // アクションを完了
        debug('ending authorize action...');
        const result: any = {
            price: 700
        };

        return repos.action.complete(action.typeOf, action.id, result);
    };
}

/**
 * Pecorino口座確保
 */
placeOrderTransactionsRouter.post(
    '/:transactionId/actions/authorize/pecorino',
    permitScopes(['transactions']),
    (req, __, next) => {
        req.checkBody('price', 'invalid price').notEmpty().withMessage('price is required').isInt();

        next();
    },
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            // pecorino支払取引サービスクライアントを生成
            pecorinoOAuth2client.setCredentials({
                access_token: req.accessToken
            });
            const payTransactionService = new sskts.pecorinoapi.service.transaction.Pay({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: pecorinoOAuth2client
            });

            const action = await sskts.service.transaction.placeOrderInProgress.action.authorize.pecorino.create(
                req.user.sub,
                req.params.transactionId,
                req.body.price
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection),
                payTransactionService: payTransactionService
            });

            res.status(CREATED).json(action);
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:transactionId/confirm',
    permitScopes(['transactions']),
    validator,
    rateLimit4transactionInProgress,
    async (req, res, next) => {
        try {
            const order = await sskts.service.transaction.placeOrderInProgress.confirm(
                req.user.sub,
                req.params.transactionId
            )({
                action: new sskts.repository.Action(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection),
                organization: new sskts.repository.Organization(sskts.mongoose.connection)
            });
            debug('transaction confirmed', order);

            res.status(CREATED).json(order);
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:transactionId/tasks/sendEmailNotification',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            const task = await sskts.service.transaction.placeOrder.sendEmail(
                req.params.transactionId,
                {
                    sender: {
                        name: req.body.sender.name,
                        email: req.body.sender.email
                    },
                    toRecipient: {
                        name: req.body.toRecipient.name,
                        email: req.body.toRecipient.email
                    },
                    about: req.body.about,
                    text: req.body.text
                }
            )({
                task: new sskts.repository.Task(sskts.mongoose.connection),
                transaction: new sskts.repository.Transaction(sskts.mongoose.connection)
            });

            res.status(CREATED).json(task);
        } catch (error) {
            next(error);
        }
    }
);

export default placeOrderTransactionsRouter;
