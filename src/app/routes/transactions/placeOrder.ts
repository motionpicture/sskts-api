/**
 * placeOrder transactions router
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
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
                agentId: req.getUser().sub,
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
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP');
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                next(new Error('invalid phone number format'));

                return;
            }

            const contacts = {
                familyName: req.body.familyName,
                givenName: req.body.givenName,
                email: req.body.email,
                telephone: phoneUtil.format(phoneNumber, PhoneNumberFormat.E164)
            };

            await sskts.service.transaction.placeOrderInProgress.setCustomerContacts(
                req.getUser().sub,
                req.params.transactionId,
                contacts
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 座席仮予約
 */
placeOrderTransactionsRouter.post(
    '/:transactionId/seatReservationAuthorization',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const findIndividualScreeningEvent = await sskts.service.event.findIndividualScreeningEventByIdentifier(
                req.body.eventIdentifier
            )(new sskts.repository.Event(sskts.mongoose.connection));

            const authorization = await sskts.service.transaction.placeOrderInProgress.createSeatReservationAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                findIndividualScreeningEvent,
                req.body.offers
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(CREATED).json(authorization);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 座席仮予約削除
 */
placeOrderTransactionsRouter.delete(
    '/:transactionId/seatReservationAuthorization/:authorizationId',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                req.params.authorizationId
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:transactionId/paymentInfos/creditCard',
    permitScopes(['transactions']),
    (req, __2, next) => {
        req.checkBody('orderId', 'invalid orderId').notEmpty().withMessage('orderId is required');
        req.checkBody('amount', 'invalid amount').notEmpty().withMessage('amount is required');
        req.checkBody('method', 'invalid method').notEmpty().withMessage('gmo_order_id is required');
        req.checkBody('creditCard', 'invalid creditCard').notEmpty().withMessage('gmo_amount is required');

        next();
    },
    validator,
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            // 会員IDを強制的にログイン中の人物IDに変更
            const creditCard: sskts.service.transaction.placeOrderInProgress.ICreditCard4authorizeAction = {
                ...req.body.creditCard,
                ...{
                    memberId: (req.getUser().username !== undefined) ? req.getUser().sub : undefined
                }
            };
            debug('authorizing credit card...', creditCard);

            debug('authorizing credit card...', req.body.creditCard);
            const authorization = await sskts.service.transaction.placeOrderInProgress.createCreditCardAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                req.body.orderId,
                req.body.amount,
                req.body.method,
                creditCard
            )(
                new sskts.repository.Organization(sskts.mongoose.connection),
                new sskts.repository.Transaction(sskts.mongoose.connection)
                );

            res.status(CREATED).json({
                id: authorization.id
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
    '/:transactionId/paymentInfos/creditCard/:authorizationId',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.cancelGMOAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                req.params.authorizationId
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

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
    '/:transactionId/discountInfos/mvtk',
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
                seatInfoSyncIn: {
                    kgygishCd: req.body.seatSyncInfoIn.kgygishCd,
                    yykDvcTyp: req.body.seatSyncInfoIn.yykDvcTyp,
                    trkshFlg: req.body.seatSyncInfoIn.trkshFlg,
                    kgygishSstmZskyykNo: req.body.seatSyncInfoIn.kgygishSstmZskyykNo,
                    kgygishUsrZskyykNo: req.body.seatSyncInfoIn.kgygishUsrZskyykNo,
                    jeiDt: req.body.seatSyncInfoIn.jeiDt,
                    kijYmd: req.body.seatSyncInfoIn.kijYmd,
                    stCd: req.body.seatSyncInfoIn.stCd,
                    screnCd: req.body.seatSyncInfoIn.screnCd,
                    knyknrNoInfo: req.body.seatSyncInfoIn.knyknrNoInfo,
                    zskInfo: req.body.seatSyncInfoIn.zskInfo,
                    skhnCd: req.body.seatSyncInfoIn.skhnCd
                }
            };
            const authorization = await sskts.service.transaction.placeOrderInProgress.createMvtkAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                authorizeObject
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(CREATED).json({
                id: authorization.id
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
    '/:transactionId/discountInfos/mvtk/:authorizationId',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuthorization(
                req.getUser().sub,
                req.params.transactionId,
                req.params.authorizationId
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.delete(
    '/:transactionId/seatReservationAuthorization/:authorizationId',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
                req.getUser().sub,
                req.params.transactionId, req.params.authorization_id
            )(new sskts.repository.Transaction(sskts.mongoose.connection));

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

// placeOrderTransactionsRouter.post(
//     '/:transactionId/notifications/email',
//     permitScopes(['transactions.notifications']),
//     (req, _, next) => {
//         req.checkBody('data').notEmpty().withMessage('required');
//         req.checkBody('data.type').equals('notifications').withMessage('must be \'notifications\'');
//         req.checkBody('data.attributes').notEmpty().withMessage('required');
//         req.checkBody('from', 'invalid from').notEmpty().withMessage('from is required');
//         req.checkBody('to', 'invalid to').notEmpty().withMessage('to is required').isEmail();
//         req.checkBody('subject', 'invalid subject').notEmpty().withMessage('subject is required');
//         req.checkBody('content', 'invalid content').notEmpty().withMessage('content is required');

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const notification = sskts.factory.notification.email.create({
//                 from: req.body.from,
//                 to: req.body.to,
//                 subject: req.body.subject,
//                 content: req.body.content
//             });
//             await sskts.service.transactionWithId.addEmail(req.params.transactionId, notification)(
//                 sskts.repository.transaction(sskts.mongoose.connection)
//             );

//             res.status(OK).json({
//                 data: {
//                     type: 'notifications',
//                     id: notification.id
//                 }
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

placeOrderTransactionsRouter.post(
    '/:transactionId/confirm',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            const order = await sskts.service.transaction.placeOrderInProgress.confirm(
                req.getUser().sub,
                req.params.transactionId
            )(new sskts.repository.Transaction(sskts.mongoose.connection));
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
            // 取引が適切かどうかチェック

            // todo その場で送信ではなくDBに登録するようにする
            const sendEmailNotification = sskts.factory.notification.email.create({
                id: sskts.mongoose.Types.ObjectId().toString(),
                data: {
                    from: req.body.from,
                    to: req.body.to,
                    subject: req.body.subject,
                    content: req.body.content
                }
            });
            await sskts.service.notification.sendEmail(sendEmailNotification)();

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

export default placeOrderTransactionsRouter;
