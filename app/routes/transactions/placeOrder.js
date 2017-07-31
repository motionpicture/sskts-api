"use strict";
/**
 * 注文取引ルーター
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placeOrderTransactionsRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const http_status_1 = require("http-status");
const moment = require("moment");
const redis = require("../../../redis");
const authentication_1 = require("../../middlewares/authentication");
const permitScopes_1 = require("../../middlewares/permitScopes");
const validator_1 = require("../../middlewares/validator");
const debug = createDebug('sskts-api:placeOrderTransactionsRouter');
placeOrderTransactionsRouter.use(authentication_1.default);
placeOrderTransactionsRouter.post('/start', permitScopes_1.default(['transactions']), (req, _, next) => {
    // expiresはsecondsのUNIXタイムスタンプで
    req.checkBody('expires', 'invalid expires').notEmpty().withMessage('expires is required').isInt();
    req.checkBody('sellerId', 'invalid sellerId').notEmpty().withMessage('sellerId is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // tslint:disable-next-line:no-magic-numbers
        if (!Number.isInteger(parseInt(process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS, 10))) {
            throw new Error('TRANSACTIONS_COUNT_UNIT_IN_SECONDS not specified');
        }
        // tslint:disable-next-line:no-magic-numbers
        if (!Number.isInteger(parseInt(process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10))) {
            throw new Error('NUMBER_OF_TRANSACTIONS_PER_UNIT not specified');
        }
        // 取引カウント単位{transactionsCountUnitInSeconds}秒から、スコープの開始終了日時を求める
        // tslint:disable-next-line:no-magic-numbers
        const transactionsCountUnitInSeconds = parseInt(process.env.TRANSACTIONS_COUNT_UNIT_IN_SECONDS, 10);
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
        const agentId = (req.user.person !== undefined) ? req.user.person.id : undefined;
        const transactionOption = yield sskts.service.transaction.placeOrder.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment.unix(parseInt(req.body.expires, 10)).toDate(),
            // tslint:disable-next-line:no-magic-numbers
            maxCountPerUnit: parseInt(process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10),
            clientUser: req.user,
            scope: scope,
            agentId: agentId,
            sellerId: req.body.sellerId
        })(sskts.adapter.person(sskts.mongoose.connection), sskts.adapter.organization(sskts.mongoose.connection), sskts.adapter.transaction(sskts.mongoose.connection), sskts.adapter.transactionCount(redis.getClient()));
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
                res.status(http_status_1.NOT_FOUND).json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 購入者情報を変更する
 */
placeOrderTransactionsRouter.put('/:id/agent/profile', permitScopes_1.default(['transactions']), (req, _, next) => {
    req.checkBody('familyName').notEmpty().withMessage('required');
    req.checkBody('givenName').notEmpty().withMessage('required');
    req.checkBody('telephone').notEmpty().withMessage('required');
    req.checkBody('email').notEmpty().withMessage('required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 会員フローの場合は使用できない
        // todo レスポンスはどんなのが適切か
        if (req.getUser().person !== undefined) {
            res.status(http_status_1.FORBIDDEN).end('Forbidden');
            return;
        }
        const profile = {
            familyName: req.body.familyName,
            givenName: req.body.givenName,
            email: req.body.email,
            telephone: req.body.telephone
        };
        yield sskts.service.transaction.placeOrder.setAgentProfile(req.params.id, profile)(sskts.adapter.person(sskts.mongoose.connection), sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 座席仮予約
 */
placeOrderTransactionsRouter.post('/:id/seatReservationAuthorization', permitScopes_1.default(['transactions']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const findIndividualScreeningEventOption = yield sskts.service.event.findIndividualScreeningEventByIdentifier(req.body.eventIdentifier)(sskts.adapter.event(sskts.mongoose.connection));
        if (findIndividualScreeningEventOption.isEmpty) {
            res.status(http_status_1.NOT_FOUND).json({
                data: null
            });
        }
        else {
            const authorization = yield sskts.service.transaction.placeOrder.createSeatReservationAuthorization(req.params.id, findIndividualScreeningEventOption.get(), req.body.offers)(sskts.adapter.transaction(sskts.mongoose.connection));
            res.status(http_status_1.CREATED).json({
                data: authorization
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 座席仮予約削除
 */
placeOrderTransactionsRouter.delete('/:transactionId/seatReservationAuthorization/:authorizationId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(req.params.transactionId, req.params.authorizationId)(sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.post('/:id/paymentInfos/creditCard', permitScopes_1.default(['transactions']), (__1, __2, next) => {
    // req.checkBody('data.orderId', 'invalid orderId').notEmpty().withMessage('orderId is required');
    // req.checkBody('data.amount', 'invalid amount').notEmpty().withMessage('amount is required');
    // req.checkBody('data.method', 'invalid method').notEmpty().withMessage('gmo_order_id is required');
    // req.checkBody('data.cardNo', 'invalid cardNo').notEmpty().withMessage('gmo_amount is required');
    // req.checkBody('data.expire', 'invalid expire').notEmpty().withMessage('gmo_access_id is required');
    // req.checkBody('data.securityCode', 'invalid securityCode').notEmpty().withMessage('gmo_access_pass is required');
    // req.checkBody('data.token', 'invalid token').notEmpty().withMessage('gmo_job_cd is required');
    next();
}, validator_1.default, 
// tslint:disable-next-line:max-func-body-length
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 会員IDを強制的にログイン中の人物IDに変更
        const creditCard = Object.assign({}, req.body.creditCard, {
            memberId: (req.user.person !== undefined) ? req.user.person.id : undefined
        });
        debug('authorizing credit card...', creditCard);
        debug('authorizing credit card...', req.body.creditCard);
        const authorization = yield sskts.service.transaction.placeOrder.createCreditCardAuthorization(req.params.id, req.body.orderId, req.body.amount, req.body.method, creditCard)(sskts.adapter.organization(sskts.mongoose.connection), sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json({
            data: authorization
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * クレジットカードオーソリ取消
 */
placeOrderTransactionsRouter.delete('/:transactionId/paymentInfos/creditCard/:authorizationId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrder.cancelGMOAuthorization(req.params.transactionId, req.params.authorizationId)(sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケ追加
 */
placeOrderTransactionsRouter.post('/:id/paymentInfos/mvtk', permitScopes_1.default(['transactions']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const authorization = sskts.factory.authorization.mvtk.create({
            price: parseInt(req.body.price, 10),
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
        yield sskts.service.transaction.placeOrder.createMvtkAuthorization(req.params.id, authorization)(sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json({
            data: authorization
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケ取消
 */
placeOrderTransactionsRouter.delete('/:transactionId/paymentInfos/mvtk/:authorizationId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrder.cancelMvtkAuthorization(req.params.transactionId, req.params.authorizationId)(sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.delete('/:id/seatReservationAuthorization/:authorizationId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(req.params.id, req.params.authorization_id)(sskts.adapter.transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
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
placeOrderTransactionsRouter.post('/:id/confirm', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const order = yield sskts.service.transaction.placeOrder.confirm(req.params.id)(sskts.adapter.transaction(sskts.mongoose.connection));
        debug('transaction confirmed', order);
        res.status(http_status_1.CREATED).json({
            data: order
        });
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.post('/:id/tasks/sendEmailNotification', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 取引が適切かどうかチェック
        // todo その場で送信ではなくDBに登録するようにする
        const sendEmailNotification = sskts.factory.notification.email.create({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content
        });
        yield sskts.service.notification.sendEmail(sendEmailNotification)();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = placeOrderTransactionsRouter;
