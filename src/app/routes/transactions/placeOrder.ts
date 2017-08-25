/**
 * placeOrder transaction router
 * @ignore
 */

import { Router } from 'express';
const placeOrderTransactionsRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND } from 'http-status';
import * as moment from 'moment';

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

            const transactionOption = await sskts.service.transaction.placeOrder.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment.unix(parseInt(req.body.expires, 10)).toDate(),
                // tslint:disable-next-line:no-magic-numbers
                maxCountPerUnit: parseInt(<string>process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10),
                clientUser: req.user,
                scope: scope,
                agentId: req.getUser().sub,
                sellerId: req.body.sellerId
            })(
                sskts.adapter.organization(sskts.mongoose.connection),
                sskts.adapter.transaction(sskts.mongoose.connection),
                sskts.adapter.transactionCount(redis.getClient())
                );

            transactionOption.match({
                Some: (transaction) => {
                    // tslint:disable-next-line:no-string-literal
                    // const host = req.headers['host'];
                    // res.setHeader('Location', `https://${host}/transactions/${transaction.id}`);
                    res.json({
                        data: transaction
                    });
                },
                None: () => {
                    res.status(NOT_FOUND).json({
                        data: null
                    });
                }
            });
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
            // 会員フローの場合は使用できない
            // todo レスポンスはどんなのが適切か
            if (req.user.person !== undefined) {
                res.status(FORBIDDEN).end('Forbidden');

                return;
            }

            const contact = {
                familyName: req.body.familyName,
                givenName: req.body.givenName,
                email: req.body.email,
                telephone: req.body.telephone
            };
            await sskts.service.transaction.placeOrder.setAgentProfile(req.params.transactionId, contact)(
                sskts.adapter.transaction(sskts.mongoose.connection)
            );

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
            const findIndividualScreeningEventOption = await sskts.service.event.findIndividualScreeningEventByIdentifier(
                req.body.eventIdentifier
            )(sskts.adapter.event(sskts.mongoose.connection));

            if (findIndividualScreeningEventOption.isEmpty) {
                res.status(NOT_FOUND).json({
                    data: null
                });
            } else {
                const authorization = await sskts.service.transaction.placeOrder.createSeatReservationAuthorization(
                    req.params.transactionId,
                    findIndividualScreeningEventOption.get(),
                    req.body.offers
                )(sskts.adapter.transaction(sskts.mongoose.connection));

                res.status(CREATED).json({
                    data: authorization
                });
            }
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
            await sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(
                req.params.transactionId,
                req.params.authorizationId
            )(sskts.adapter.transaction(sskts.mongoose.connection));

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
            const creditCard: sskts.service.transaction.placeOrder.ICreditCard4authorization = {
                ...req.body.creditCard,
                ...{
                    memberId: (req.getUser().username !== undefined) ? req.getUser().sub : undefined
                }
            };
            debug('authorizing credit card...', creditCard);

            debug('authorizing credit card...', req.body.creditCard);
            const authorization = await sskts.service.transaction.placeOrder.createCreditCardAuthorization(
                req.params.transactionId,
                req.body.orderId,
                req.body.amount,
                req.body.method,
                creditCard
            )(
                sskts.adapter.organization(sskts.mongoose.connection),
                sskts.adapter.transaction(sskts.mongoose.connection)
                );

            res.status(CREATED).json({
                data: authorization
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
            await sskts.service.transaction.placeOrder.cancelGMOAuthorization(
                req.params.transactionId,
                req.params.authorizationId
            )(sskts.adapter.transaction(sskts.mongoose.connection));

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
            const authorizationResult = {
                // tslint:disable-next-line:no-magic-numbers
                price: parseInt(req.body.price, 10),
                kgygishCd: req.body.kgygishCd,
                yykDvcTyp: req.body.yykDvcTyp,
                trkshFlg: req.body.trkshFlg,
                kgygishSstmZskyykNo: req.body.kgygishSstmZskyykNo,
                kgygishUsrZskyykNo: req.body.kgygishUsrZskyykNo,
                jeiDt: req.body.jeiDt,
                kijYmd: req.body.kijYmd,
                stCd: req.body.stCd,
                screnCd: req.body.screnCd,
                knyknrNoInfo: req.body.knyknrNoInfo,
                zskInfo: req.body.zskInfo,
                skhnCd: req.body.skhnCd
            };
            const authorization = await sskts.service.transaction.placeOrder.createMvtkAuthorization(
                req.params.transactionId, authorizationResult
            )(sskts.adapter.transaction(sskts.mongoose.connection));

            res.status(CREATED).json({
                data: authorization
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
            await sskts.service.transaction.placeOrder.cancelMvtkAuthorization(
                req.params.transactionId,
                req.params.authorizationId
            )(sskts.adapter.transaction(sskts.mongoose.connection));

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
            await sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(
                req.params.transactionId, req.params.authorization_id
            )(sskts.adapter.transaction(sskts.mongoose.connection));

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
//                 sskts.adapter.transaction(sskts.mongoose.connection)
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
            const order = await sskts.service.transaction.placeOrder.confirm(req.params.transactionId)(
                sskts.adapter.transaction(sskts.mongoose.connection)
            );
            debug('transaction confirmed', order);

            res.status(CREATED).json({
                data: order
            });
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
                from: req.body.from,
                to: req.body.to,
                subject: req.body.subject,
                content: req.body.content
            });
            await sskts.service.notification.sendEmail(sendEmailNotification)();

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

export default placeOrderTransactionsRouter;
