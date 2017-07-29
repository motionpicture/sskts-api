/**
 * 注文取引ルーター
 *
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
        // expiresはsecondsのUNIXタイムスタンプで
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

            // todo 取引スコープを分ける仕様に従って変更する
            const scope = sskts.factory.transactionScope.create({
                readyFrom: readyFrom.toDate(),
                readyThrough: readyThrough.toDate()
            });
            debug('starting a transaction...scope:', scope);

            // 会員としてログインしている場合は所有者IDを指定して開始する
            const ownerId = (req.getUser().owner !== undefined) ? <string>req.getUser().owner : undefined;
            const transactionOption = await sskts.service.transaction.placeOrder.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment.unix(parseInt(req.body.expires, 10)).toDate(),
                // tslint:disable-next-line:no-magic-numbers
                maxCountPerUnit: parseInt(<string>process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10),
                clientUser: req.getUser(),
                scope: scope,
                agentId: ownerId,
                sellerId: req.body.sellerId
            })(
                sskts.adapter.person(sskts.mongoose.connection),
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

// placeOrderTransactionsRouter.get(
//     '/:id',
//     permitScopes(['transactions', 'transactions.read-only']),
//     (_1, _2, next) => {
//         // todo validation

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const option = await sskts.service.transactionWithId.findById(req.params.id)(
//                 sskts.adapter.transaction(sskts.mongoose.connection)
//             );
//             option.match({
//                 Some: (transaction) => {
//                     res.json({
//                         data: {
//                             type: 'transactions',
//                             id: transaction.id,
//                             attributes: transaction
//                         }
//                     });
//                 },
//                 None: () => {
//                     res.status(NOT_FOUND);
//                     res.json({
//                         data: null
//                     });
//                 }
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

/**
 * 購入者情報を変更する
 */
placeOrderTransactionsRouter.put(
    '/:id/agent/profile',
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
            if (req.getUser().owner !== undefined) {
                res.status(FORBIDDEN).end('Forbidden');

                return;
            }

            const profile = {
                familyName: req.body.familyName,
                givenName: req.body.givenName,
                email: req.body.email,
                telephone: req.body.telephone
            };
            await sskts.service.transaction.placeOrder.setAgentProfile(req.params.id, profile)(
                sskts.adapter.person(sskts.mongoose.connection),
                sskts.adapter.transaction(sskts.mongoose.connection)
            );

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード追加
 */
// placeOrderTransactionsRouter.post(
//     '/:id/owners/:ownerId/cards',
//     permitScopes(['transactions.owners.cards']),
//     (req, _2, next) => {
//         /*
//         req.body = {
//             data: {
//                 type: 'cards',
//                 attributes: {
//                     card_no: 'xxx',
//                     card_pass: '',
//                     expire: 'xxx',
//                     holder_name: 'xxx',
//                     token: 'xxx',
//                 }
//             }
//         }
//         */
//         req.checkBody('data').notEmpty().withMessage('required');
//         req.checkBody('data.type').equals('cards').withMessage('must be \'cards\'');
//         req.checkBody('data.attributes').notEmpty().withMessage('required');
//         req.checkBody('card_no').optional().notEmpty().withMessage('required');
//         // req.checkBody('card_pass').optional().notEmpty().withMessage('required');
//         req.checkBody('expire').optional().notEmpty().withMessage('required');
//         req.checkBody('holder_name').optional().notEmpty().withMessage('required');
//         req.checkBody('token').optional().notEmpty().withMessage('required');
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             // 生のカード情報の場合
//             const card = sskts.factory.card.gmo.createUncheckedCardRaw(req.body.data.attributes);
//             const addedCard = await sskts.service.member.addCard(req.params.ownerId, card)();

//             res.status(CREATED).json({
//                 data: {
//                     type: 'cards',
//                     id: addedCard.id.toString(),
//                     attributes: { ...addedCard, ...{ id: undefined } }
//                 }
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );

/**
 * 座席仮予約
 */
placeOrderTransactionsRouter.post(
    '/:id/seatReservationAuthorization',
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
                    req.params.id,
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
    '/:id/paymentInfos/creditCard',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        // req.checkBody('data.orderId', 'invalid orderId').notEmpty().withMessage('orderId is required');
        // req.checkBody('data.amount', 'invalid amount').notEmpty().withMessage('amount is required');
        // req.checkBody('data.method', 'invalid method').notEmpty().withMessage('gmo_order_id is required');
        // req.checkBody('data.cardNo', 'invalid cardNo').notEmpty().withMessage('gmo_amount is required');
        // req.checkBody('data.expire', 'invalid expire').notEmpty().withMessage('gmo_access_id is required');
        // req.checkBody('data.securityCode', 'invalid securityCode').notEmpty().withMessage('gmo_access_pass is required');
        // req.checkBody('data.token', 'invalid token').notEmpty().withMessage('gmo_job_cd is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const gmoAuthorization = {
                orderId: req.body.orderId,
                amount: req.body.amount,
                method: req.body.method,
                cardNo: req.body.cardNo,
                expire: req.body.expire,
                securityCode: req.body.securityCode,
                token: req.body.token
            };
            const authorization = await sskts.service.transaction.placeOrder.authorizeGMOCard(req.params.id, gmoAuthorization)(
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
    '/:id/paymentInfos/mvtk',
    permitScopes(['transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const authorization = sskts.factory.authorization.mvtk.create({
                price: parseInt(req.body.price, 10), // tslint:disable-line:no-magic-numbers
                result: {
                    kgygish_cd: req.body.kgygish_cd,
                    yyk_dvc_typ: req.body.yyk_dvc_typ,
                    trksh_flg: req.body.trksh_flg,
                    kgygish_sstm_zskyyk_no: req.body.kgygish_sstm_zskyyk_no,
                    kgygish_usr_zskyyk_no: req.body.kgygish_usr_zskyyk_no,
                    jei_dt: req.body.jei_dt,
                    kij_ymd: req.body.kij_ymd,
                    st_cd: req.body.st_cd,
                    scren_cd: req.body.scren_cd,
                    knyknr_no_info: req.body.knyknr_no_info,
                    zsk_info: req.body.zsk_info,
                    skhn_cd: req.body.skhn_cd
                },
                object: {}
            });
            await sskts.service.transaction.placeOrder.createMvtkAuthorization(req.params.id, authorization)(
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
 * ムビチケ取消
 */
placeOrderTransactionsRouter.delete(
    '/:transactionId/paymentInfos/mvtk/:authorizationId',
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
    '/:id/seatReservationAuthorization/:authorizationId',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(req.params.id, req.params.authorization_id)(
                sskts.adapter.transaction(sskts.mongoose.connection)
            );

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

// placeOrderTransactionsRouter.post(
//     '/:id/notifications/email',
//     permitScopes(['transactions.notifications']),
//     (req, _, next) => {
//         // 互換性維持のための対応
//         if (req.body.data === undefined) {
//             req.body.data = {
//                 type: 'notifications',
//                 attributes: req.body
//             };
//         }

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
//             await sskts.service.transactionWithId.addEmail(req.params.id, notification)(
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

// placeOrderTransactionsRouter.delete(
//     '/:id/notifications/:notification_id',
//     permitScopes(['transactions.notifications']),
//     (_1, _2, next) => {
//         // todo validations

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             await sskts.service.transactionWithId.removeEmail(req.params.id, req.params.notification_id)(
//                 sskts.adapter.transaction(sskts.mongoose.connection)
//             );

//             res.status(NO_CONTENT).end();
//         } catch (error) {
//             next(error);
//         }
//     }
// );

placeOrderTransactionsRouter.post(
    '/:id/confirm',
    permitScopes(['transactions']),
    validator,
    async (req, res, next) => {
        try {
            const order = await sskts.service.transaction.placeOrder.confirm(req.params.id)(
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
    '/:id/tasks/sendEmailNotification',
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
