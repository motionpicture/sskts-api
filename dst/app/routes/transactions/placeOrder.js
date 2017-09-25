"use strict";
/**
 * placeOrder transactions router
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
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const express_1 = require("express");
const google_libphonenumber_1 = require("google-libphonenumber");
const http_status_1 = require("http-status");
const moment = require("moment");
const placeOrderTransactionsRouter = express_1.Router();
const redis = require("../../../redis");
const authentication_1 = require("../../middlewares/authentication");
const permitScopes_1 = require("../../middlewares/permitScopes");
const validator_1 = require("../../middlewares/validator");
const debug = createDebug('sskts-api:placeOrderTransactionsRouter');
placeOrderTransactionsRouter.use(authentication_1.default);
placeOrderTransactionsRouter.post('/start', permitScopes_1.default(['transactions']), (req, _, next) => {
    // expires is unix timestamp (in seconds)
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
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 取引スコープを分ける仕様に従って変更する
        const scope = sskts.factory.transactionScope.create({
            readyFrom: readyFrom.toDate(),
            readyThrough: readyThrough.toDate()
        });
        debug('starting a transaction...scope:', scope);
        const transaction = yield sskts.service.transaction.placeOrderInProgress.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment.unix(parseInt(req.body.expires, 10)).toDate(),
            // tslint:disable-next-line:no-magic-numbers
            maxCountPerUnit: parseInt(process.env.NUMBER_OF_TRANSACTIONS_PER_UNIT, 10),
            clientUser: req.user,
            scope: scope,
            agentId: req.user.sub,
            sellerId: req.body.sellerId
        })(new sskts.repository.Organization(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection), new sskts.repository.TransactionCount(redis.getClient()));
        // tslint:disable-next-line:no-string-literal
        // const host = req.headers['host'];
        // res.setHeader('Location', `https://${host}/transactions/${transaction.id}`);
        res.json(transaction);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 購入者情報を変更する
 */
placeOrderTransactionsRouter.put('/:transactionId/customerContact', permitScopes_1.default(['transactions']), (req, _, next) => {
    req.checkBody('familyName').notEmpty().withMessage('required');
    req.checkBody('givenName').notEmpty().withMessage('required');
    req.checkBody('telephone').notEmpty().withMessage('required');
    req.checkBody('email').notEmpty().withMessage('required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse(req.body.telephone, 'JP');
        if (!phoneUtil.isValidNumber(phoneNumber)) {
            next(new Error('invalid phone number format'));
            return;
        }
        const contacts = {
            familyName: req.body.familyName,
            givenName: req.body.givenName,
            email: req.body.email,
            telephone: phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.E164)
        };
        yield sskts.service.transaction.placeOrderInProgress.setCustomerContacts(req.user.sub, req.params.transactionId, contacts)(new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json(contacts);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 座席仮予約
 */
placeOrderTransactionsRouter.post('/:transactionId/actions/authorize/seatReservation', permitScopes_1.default(['transactions']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const findIndividualScreeningEvent = yield sskts.service.event.findIndividualScreeningEventByIdentifier(req.body.eventIdentifier)(new sskts.repository.Event(sskts.mongoose.connection));
        const action = yield sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(req.user.sub, req.params.transactionId, findIndividualScreeningEvent, req.body.offers)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json(action);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 座席仮予約削除
 */
placeOrderTransactionsRouter.delete('/:transactionId/actions/authorize/seatReservation/:actionId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuth(req.user.sub, req.params.transactionId, req.params.actionId)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.post('/:transactionId/actions/authorize/creditCard', permitScopes_1.default(['transactions']), (req, __2, next) => {
    req.checkBody('orderId', 'invalid orderId').notEmpty().withMessage('orderId is required');
    req.checkBody('amount', 'invalid amount').notEmpty().withMessage('amount is required');
    req.checkBody('method', 'invalid method').notEmpty().withMessage('gmo_order_id is required');
    req.checkBody('creditCard', 'invalid creditCard').notEmpty().withMessage('gmo_amount is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // 会員IDを強制的にログイン中の人物IDに変更
        const creditCard = Object.assign({}, req.body.creditCard, {
            memberId: (req.user.username !== undefined) ? req.user.sub : undefined
        });
        debug('authorizing credit card...', creditCard);
        debug('authorizing credit card...', req.body.creditCard);
        const action = yield sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(req.user.sub, req.params.transactionId, req.body.orderId, req.body.amount, req.body.method, creditCard)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Organization(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json({
            id: action.id
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * クレジットカードオーソリ取消
 */
placeOrderTransactionsRouter.delete('/:transactionId/actions/authorize/creditCard/:actionId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrderInProgress.cancelCreditCardAuth(req.user.sub, req.params.transactionId, req.params.actionId)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケ追加
 */
placeOrderTransactionsRouter.post('/:transactionId/actions/authorize/mvtk', permitScopes_1.default(['transactions']), (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
        const action = yield sskts.service.transaction.placeOrderInProgress.authorizeMvtk(req.user.sub, req.params.transactionId, authorizeObject)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json({
            id: action.id
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * ムビチケ取消
 */
placeOrderTransactionsRouter.delete('/:transactionId/actions/authorize/mvtk/:actionId', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.transaction.placeOrderInProgress.cancelMvtkAuth(req.user.sub, req.params.transactionId, req.params.actionId)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.post('/:transactionId/confirm', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const order = yield sskts.service.transaction.placeOrderInProgress.confirm(req.user.sub, req.params.transactionId)(new sskts.repository.action.Authorize(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        debug('transaction confirmed', order);
        res.status(http_status_1.CREATED).json(order);
    }
    catch (error) {
        next(error);
    }
}));
placeOrderTransactionsRouter.post('/:transactionId/tasks/sendEmailNotification', permitScopes_1.default(['transactions']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const task = yield sskts.service.transaction.placeOrder.sendEmail(req.params.transactionId, {
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
        })(new sskts.repository.Task(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection));
        res.status(http_status_1.CREATED).json(task);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = placeOrderTransactionsRouter;
