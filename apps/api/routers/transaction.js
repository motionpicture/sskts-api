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
const authentication4transaction_1 = require("../middlewares/authentication4transaction");
const owner_1 = require("../../domain/repository/interpreter/owner");
const transaction_1 = require("../../domain/repository/interpreter/transaction");
const transaction_2 = require("../../domain/service/interpreter/transaction");
router.post("/transaction/start", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    let ownerIds = req.body.owners;
    let transaction = yield transaction_2.default.start(new Date(), ownerIds)(owner_1.default, transaction_1.default);
    res.json({
        success: true,
        message: null,
        transaction: transaction
    });
}));
router.post("/transaction/:id/addGMOAuthorization", authentication4transaction_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.addGMOAuthorization({
            transaction_id: req.params.id,
            transaction_password: req.body.transaction_password,
            owner_id: req.body.owner_id,
            gmo_shop_id: req.body.gmo_shop_id,
            gmo_shop_password: req.body.gmo_shop_password,
            gmo_order_id: req.body.gmo_order_id,
            gmo_amount: req.body.gmo_amount,
            gmo_access_id: req.body.gmo_access_id,
            gmo_access_password: req.body.gmo_access_password,
            gmo_job_cd: req.body.gmo_job_cd,
            gmo_pay_type: req.body.gmo_pay_type,
        })(transaction_1.default);
        res.json({
            success: true,
            message: null,
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/transaction/:id/addCOAAuthorization", authentication4transaction_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield transaction_2.default.addCOAAuthorization({
            transaction_id: req.params.id,
            transaction_password: req.body.transaction_password,
            owner_id: req.body.owner_id,
            coa_tmp_reserve_num: req.body.coa_tmp_reserve_num,
            seats: req.body.seats,
        })(transaction_1.default);
        res.json({
            success: true,
            message: null,
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/transaction/:id/close", authentication4transaction_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    yield transaction_2.default.close(req.params.id)(transaction_1.default);
    res.json({
        success: true,
        message: null,
    });
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
