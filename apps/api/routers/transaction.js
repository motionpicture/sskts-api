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
const owner_1 = require("../../domain/repository/interpreter/owner");
const transaction_1 = require("../../domain/repository/interpreter/transaction");
const transaction_2 = require("../../domain/service/interpreter/transaction");
router.get("/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let option = yield transaction_1.default.findById(req.params.id);
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
        let ownerIds = req.body.owners;
        let transaction = yield transaction_2.default.start({
            expired_at: new Date(),
            owner_ids: ownerIds
        })(owner_1.default, transaction_1.default);
        res.status(201);
        res.setHeader("Location", `https://${req.headers["host"]}/transactions/${transaction._id}`);
        res.json({
            data: {
                type: "transactions",
                _id: transaction._id,
            }
        });
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
            owner_id: req.body.owner_id,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_pass: req.body.gmo_shop_pass,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_pass: req.body.gmo_access_pass,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
        })(transaction_1.default);
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
            owner_id: req.body.owner_id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
            seats: req.body.seats,
        })(transaction_1.default);
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
        })(transaction_1.default);
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
        })(transaction_1.default);
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
        })(transaction_1.default);
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
