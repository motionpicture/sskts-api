/**
 * 注文取引ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const placeOrderTransactionsRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { CREATED, FORBIDDEN, NO_CONTENT, NOT_FOUND, OK } from 'http-status';
import * as moment from 'moment';

import * as redis from '../../../redis';

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const debug = createDebug('sskts-api:placeOrderTransactionsRouter');

placeOrderTransactionsRouter.use(authentication);

placeOrderTransactionsRouter.post(
    '/start',
    permitScopes(['admin', 'transactions']),
    (req, _, next) => {
        // expiresはsecondsのUNIXタイムスタンプで
        req.checkBody('expires', 'invalid expires').notEmpty().withMessage('expires is required').isInt();

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
                sellerId: '597012c4ca579a808193cde2' // todo 動的に変更
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
                        data: {
                            type: 'transactions',
                            id: transaction.id,
                            attributes: transaction
                        }
                    });
                },
                None: () => {
                    res.status(NOT_FOUND);
                    res.json({
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// placeOrderTransactionsRouter.post(
//     '/makeInquiry',
//     permitScopes(['admin', 'transactions', 'transactions.read-only']),
//     (req, _, next) => {
//         req.checkBody('inquiry_theater', 'invalid inquiry_theater').notEmpty().withMessage('inquiry_theater is required');
//         req.checkBody('inquiry_id', 'invalid inquiry_id').notEmpty().withMessage('inquiry_id is required');
//         req.checkBody('inquiry_pass', 'invalid inquiry_pass').notEmpty().withMessage('inquiry_pass is required');

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const key = sskts.factory.transactionInquiryKey.create({
//                 theater_code: req.body.inquiry_theater,
//                 reserve_num: req.body.inquiry_id,
//                 tel: req.body.inquiry_pass
//             });
//             const option = await sskts.service.transaction.makeInquiry(key)(sskts.adapter.transaction(sskts.mongoose.connection));

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

// placeOrderTransactionsRouter.get(
//     '/:id',
//     permitScopes(['admin', 'transactions', 'transactions.read-only']),
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

// placeOrderTransactionsRouter.patch(
//     '/:id/anonymousOwner',
//     permitScopes(['admin', 'transactions.owners']),
//     (req, _, next) => {
//         req.checkBody('name_first', 'invalid name_first').optional().notEmpty().withMessage('name_first should not be empty');
//         req.checkBody('name_last', 'invalid name_last').optional().notEmpty().withMessage('name_last should not be empty');
//         req.checkBody('tel', 'invalid tel').optional().notEmpty().withMessage('tel should not be empty');
//         req.checkBody('email', 'invalid email').optional().notEmpty().withMessage('email should not be empty');

//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
//             const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);

//             // 取引から匿名所有者を取り出す
//             const transactionOption = await sskts.service.transactionWithId.findById(req.params.id)(transactionAdapter);
//             const transaction = transactionOption.get();
//             const anonymousOwner = transaction.owners.find((owner) => owner.group === sskts.factory.ownerGroup.ANONYMOUS);
//             if (anonymousOwner === undefined) {
//                 throw new Error('anonymous owner not found');
//             }

//             // 匿名所有者に対してプロフィールをマージする
//             const profile = sskts.factory.owner.anonymous.create({
//                 id: anonymousOwner.id,
//                 name_first: req.body.name_first,
//                 name_last: req.body.name_last,
//                 email: req.body.email,
//                 tel: req.body.tel
//             });
//             await sskts.service.transactionWithId.setOwnerProfile(req.params.id, profile)(ownerAdapter, transactionAdapter);

//             res.status(NO_CONTENT).end();
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
    permitScopes(['admin', 'transactions']),
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
//     permitScopes(['admin', 'transactions.owners.cards']),
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

placeOrderTransactionsRouter.post(
    '/:id/paymentInfos/creditCard',
    permitScopes(['admin', 'transactions']),
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

            res.status(OK).json({
                data: authorization
            });
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:id/seatReservationAuthorization',
    permitScopes(['admin', 'transactions']),
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.event.findIndividualScreeningEventByIdentifier(req.body.eventIdentifier)(
                sskts.adapter.event(sskts.mongoose.connection)
            ).then((option) => {
                option.match({
                    Some: async (event) => {
                        const authorization = await sskts.service.transaction.placeOrder.createSeatReservationAuthorization(
                            req.params.id,
                            event,
                            req.body.offers
                            // [
                            //     {
                            //         seatSection: string;
                            //         seatNumber: string;
                            //         ticket: {
                            //             ticket_code: string;
                            //             std_price: number;
                            //             add_price: number;
                            //             dis_price: number;
                            //             sale_price: number;
                            //             mvtk_app_price: number;
                            //             ticket_count: number;
                            //             seat_num: string;
                            //             add_glasses: number;
                            //             kbn_eisyahousiki: string;
                            //             mvtk_num: string;
                            //             mvtk_kbn_denshiken: string;
                            //             mvtk_kbn_maeuriken: string;
                            //             mvtk_kbn_kensyu: string;
                            //             mvtk_sales_price: number;
                            //         }
                            //     }
                            // ]
                        )(sskts.adapter.transaction(sskts.mongoose.connection));

                        res.status(OK).json({
                            data: authorization
                        });
                    },
                    None: () => {
                        res.status(NOT_FOUND).json({
                            data: null
                        });
                    }
                });
            });
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.post(
    '/:id/paymentInfos/mvtk',
    permitScopes(['admin', 'transactions']),
    (req, _, next) => {
        // 互換性維持のための対応
        if (req.body.data === undefined) {
            req.body.data = {
                type: 'authorizations',
                attributes: req.body
            };
        }

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

            res.status(OK).json({
                data: authorization
            });
        } catch (error) {
            next(error);
        }
    }
);

placeOrderTransactionsRouter.delete(
    '/:id/seatReservationAuthorization/:authorizationId',
    permitScopes(['admin', 'transactions']),
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
//     permitScopes(['admin', 'transactions.notifications']),
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
//     permitScopes(['admin', 'transactions.notifications']),
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
    permitScopes(['admin', 'transactions']),
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

export default placeOrderTransactionsRouter;
