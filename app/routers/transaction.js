"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transactionルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const sskts = require("@motionpicture/sskts-domain");
const HTTPStatus = require("http-status");
const moment = require("moment");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
router.use(authentication_1.default);
router.post('/makeInquiry', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validation
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const key = sskts.model.TransactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        const option = yield sskts.service.transaction.makeInquiry(key)(sskts.createTransactionRepository(mongoose.connection));
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        id: transaction.id,
                        attributes: transaction
                    }
                });
            },
            None: () => {
                res.status(HTTPStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validation
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const option = yield sskts.service.transaction.findById(req.params.id)(sskts.createTransactionRepository(mongoose.connection));
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: 'transactions',
                        id: transaction.id,
                        attributes: transaction
                    }
                });
            },
            None: () => {
                res.status(HTTPStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    // todo ownersの型チェック
    // expired_atはsecondsのUNIXタイムスタンプで
    try {
        // tslint:disable-next-line:no-magic-numbers
        const transaction = yield sskts.service.transaction.start(moment.unix(parseInt(req.body.expired_at, 10)).toDate())(sskts.createOwnerRepository(mongoose.connection), sskts.createTransactionRepository(mongoose.connection));
        // tslint:disable-next-line:no-string-literal
        const hots = req.headers['host'];
        res.status(HTTPStatus.CREATED);
        res.setHeader('Location', `https://${hots}/transactions/${transaction.id}`);
        res.json({
            data: {
                type: 'transactions',
                id: transaction.id,
                attributes: transaction
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/anonymousOwner', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // req.checkBody('group', 'invalid group.').notEmpty();
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        yield sskts.service.transaction.updateAnonymousOwner({
            transaction_id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email
        })(sskts.createOwnerRepository(mongoose.connection), sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/authorizations/gmo', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validations
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const authorization = sskts.model.Authorization.createGMO({
            owner_from: req.body.owner_id_from,
            owner_to: req.body.owner_id_to,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_pass: req.body.gmo_shop_pass,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_pass: req.body.gmo_access_pass,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
            price: req.body.gmo_amount
        });
        yield sskts.service.transaction.addGMOAuthorization(req.params.id, authorization)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.OK).json({
            data: {
                type: 'authorizations',
                id: authorization.id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/authorizations/coaSeatReservation', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validations
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const authorization = sskts.model.Authorization.createCOASeatReservation({
            owner_from: req.body.owner_id_from,
            owner_to: req.body.owner_id_to,
            // tslint:disable-next-line:no-magic-numbers
            coa_tmp_reserve_num: parseInt(req.body.coa_tmp_reserve_num, 10),
            coa_theater_code: req.body.coa_theater_code,
            coa_date_jouei: req.body.coa_date_jouei,
            coa_title_code: req.body.coa_title_code,
            coa_title_branch_num: req.body.coa_title_branch_num,
            coa_time_begin: req.body.coa_time_begin,
            coa_screen_code: req.body.coa_screen_code,
            assets: req.body.seats.map((seat) => {
                return sskts.model.Asset.createSeatReservation({
                    ownership: sskts.model.Ownership.create({
                        owner: req.body.owner_id_to,
                        authenticated: false
                    }),
                    authorizations: [],
                    performance: seat.performance,
                    section: seat.section,
                    seat_code: seat.seat_code,
                    ticket_code: seat.ticket_code,
                    ticket_name_ja: seat.ticket_name_ja,
                    ticket_name_en: seat.ticket_name_en,
                    ticket_name_kana: seat.ticket_name_kana,
                    std_price: seat.std_price,
                    add_price: seat.add_price,
                    dis_price: seat.dis_price,
                    sale_price: seat.sale_price
                });
            }),
            // tslint:disable-next-line:no-magic-numbers
            price: parseInt(req.body.price, 10)
        });
        yield sskts.service.transaction.addCOASeatReservationAuthorization(req.params.id, authorization)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.OK).json({
            data: {
                type: 'authorizations',
                id: authorization.id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id/authorizations/:authorization_id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validations
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        yield sskts.service.transaction.removeAuthorization(req.params.id, req.params.authorization_id)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/enableInquiry', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const key = sskts.model.TransactionInquiryKey.create({
            theater_code: req.body.inquiry_theater,
            reserve_num: req.body.inquiry_id,
            tel: req.body.inquiry_pass
        });
        yield sskts.service.transaction.enableInquiry(req.params.id, key)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
router.post('/:id/notifications/email', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validations
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const notification = sskts.model.Notification.createEmail({
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content
        });
        yield sskts.service.transaction.addEmail(req.params.id, notification)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.OK).json({
            data: {
                type: 'notifications',
                id: notification.id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id/notifications/:notification_id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // todo validations
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        yield sskts.service.transaction.removeEmail(req.params.id, req.params.notification_id)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/close', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        yield sskts.service.transaction.close(req.params.id)(sskts.createTransactionRepository(mongoose.connection));
        res.status(HTTPStatus.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
