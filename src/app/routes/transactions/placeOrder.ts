/**
 * placeOrder transactions router
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
            })(
                new sskts.repository.Organization(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

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
            )(
                new sskts.repository.Event(sskts.mongoose.connection),
                new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(
                new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(
                new sskts.repository.Event(sskts.mongoose.connection),
                new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(
                new sskts.repository.action.authorize.CreditCard(sskts.mongoose.connection),
                new sskts.repository.Organization(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(
                new sskts.repository.action.authorize.CreditCard(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
                typeOf: <'Mvtk'>'Mvtk',
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
            )(
                new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection),
                new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

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
            )(
                new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

            res.status(NO_CONTENT).end();
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
            )(
                new sskts.repository.action.authorize.CreditCard(sskts.mongoose.connection),
                new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection),
                new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );
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
            )(
                new sskts.repository.Task(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

            res.status(CREATED).json(task);
        } catch (error) {
            next(error);
        }
    }
);

export default placeOrderTransactionsRouter;
