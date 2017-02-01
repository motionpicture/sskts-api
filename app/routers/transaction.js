"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
let router = express.Router();
const owner_1 = require("../../domain/default/repository/interpreter/owner");
const transaction_1 = require("../../domain/default/repository/interpreter/transaction");
const transaction_2 = require("../../domain/default/service/interpreter/transaction");
const mongoose = require("mongoose");
router.get("/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let option = yield transaction_2.default.findById({
            transaction_id: req.params.id
        })(transaction_1.default(mongoose.connection));
        option.match({
            Some: (transaction) => {
                res.json({
                    data: {
                        type: "transactions",
                        _id: transaction._id,
                        attributes: transaction
                    }
                });
            },
            None: () => {
                res.status(404);
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
router.post("", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let transaction = yield transaction_2.default.start({
            expired_at: new Date(parseInt(req.body.expired_at) * 1000),
        })(owner_1.default(mongoose.connection), transaction_1.default(mongoose.connection));
        res.status(201);
        res.setHeader("Location", `https://${req.headers["host"]}/transactions/${transaction._id}`);
        res.json({
            data: {
                type: "transactions",
                _id: transaction._id,
                attributes: transaction
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/:id/anonymousOwner", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.updateAnonymousOwner({
            transaction_id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email,
        })(owner_1.default(mongoose.connection), transaction_1.default(mongoose.connection));
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
router.post("/:id/authorizations/gmo", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let authorization = yield transaction_2.default.addGMOAuthorization({
            transaction_id: req.params.id,
            owner_id_from: req.body.owner_id_from,
            owner_id_to: req.body.owner_id_to,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_pass: req.body.gmo_shop_pass,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_pass: req.body.gmo_access_pass,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
        })(owner_1.default(mongoose.connection), transaction_1.default(mongoose.connection));
        res.status(200).json({
            data: {
                type: "authorizations",
                _id: authorization._id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/:id/authorizations/coaSeatReservation", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let authorization = yield transaction_2.default.addCOASeatReservationAuthorization({
            transaction_id: req.params.id,
            owner_id_from: req.body.owner_id_from,
            owner_id_to: req.body.owner_id_to,
            coa_tmp_reserve_num: parseInt(req.body.coa_tmp_reserve_num),
            coa_theater_code: req.body.coa_theater_code,
            coa_date_jouei: req.body.coa_date_jouei,
            coa_title_code: req.body.coa_title_code,
            coa_title_branch_num: req.body.coa_title_branch_num,
            coa_time_begin: req.body.coa_time_begin,
            coa_screen_code: req.body.coa_screen_code,
            price: parseInt(req.body.price),
            seats: req.body.seats,
        })(owner_1.default(mongoose.connection), transaction_1.default(mongoose.connection));
        res.status(200).json({
            data: {
                type: "authorizations",
                _id: authorization._id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete("/:id/authorizations/:authorization_id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.removeAuthorization({
            transaction_id: req.params.id,
            authorization_id: req.params.authorization_id,
        })(transaction_1.default(mongoose.connection));
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/:id/enableInquiry", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.enableInquiry({
            transaction_id: req.params.id,
            inquiry_id: req.body.inquiry_id,
            inquiry_pass: req.body.inquiry_pass,
        })(transaction_1.default(mongoose.connection));
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
router.post("/:id/notifications/email", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let notification = yield transaction_2.default.addEmail({
            transaction_id: req.params.id,
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            content: req.body.content,
        })(transaction_1.default(mongoose.connection));
        res.status(200).json({
            data: {
                type: "notification_id",
                _id: notification._id
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.delete("/:id/notifications/:notification_id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.removeEmail({
            transaction_id: req.params.id,
            notification_id: req.params.notification_id,
        })(transaction_1.default(mongoose.connection));
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/:id/close", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.close({
            transaction_id: req.params.id
        })(transaction_1.default(mongoose.connection));
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
