/**
 * placeOrder transactions router
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import { CREATED, NO_CONTENT } from 'http-status';
import * as moment from 'moment';

const placeOrderTransactionsRouter = Router();
import * as redis from '../../../redis';

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const debug = createDebug('sskts-api:placeOrderTransactionsRouter');

placeOrderTransactionsRouter.use(authentication);

placeOrderTransactionsRouter.post(
    '/start',
    permitScopes(['transactions']),
    (req, _, next) => {
        // expires is unix timestamp (in seconds)
        req.checkBody('expires', 'invalid expires').notEmpty().withMessage('expires is required').isInt();
        req.checkBody('sellerId', 'invalid sellerId').notEmpty().withMessage('sellerId is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            // tslint:disable-next-line:no-magic-numbers
            if (!Number.isInteger(parseInt(<string>process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS, 10))) {
                throw new Error('TRANSACTIONS_COUNT_UNIT_IN_SECONDS not specified');
            }
            // tslint:disable-next-line:no-magic-numbers
            if (!Number.isInteger(parseInt(<string>process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10))) {
                throw new Error('NUMBER_OF_TRANSACTIONS_PER_UNIT not specified');
            }

            // 取引カウント単位{transactionsCountUnitInSeconds}秒から、スコープの開始終了日時を求める
            // tslint:disable-next-line:no-magic-numbers
            const transactionsCountUnitInSeconds = parseInt(<string>process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS, 10);
            const dateNow = moment();
            const readyFrom = moment.unix(dateNow.unix() - dateNow.unix() % transactionsCountUnitInSeconds);
            const readyThrough = moment(readyFrom).add(transactionsCountUnitInSeconds, 'seconds');

            // tslint:disable-next-line:no-suspicious-comment
            // TODO 取引スコープを分ける仕様に従って変更する
            const scope = sskts.factory.transactionScope.create({
                readyFrom: readyFrom.toDate(),
                readyThrough: readyThrough.toDate()
            });
            debug('starting a transaction...scope:', scope);

            const transaction = await sskts.service.transaction.placeOrderInProgress.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment.unix(parseInt(req.body.expires, 10)).toDate(),
                // tslint:disable-next-line:no-magic-numbers
                maxCountPerUnit: parseInt(<string>process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10),
                clientUser: req.user,
                scope: scope,
                agentId: req.user.sub,
                sellerId: req.body.sellerId
            })(
                new sskts.repository.Organization(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection),
                new sskts.repository.TransactionCount(redis.getClient())
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
    async (req, res, next) => {
        try {
            const authorizeObject = {
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
