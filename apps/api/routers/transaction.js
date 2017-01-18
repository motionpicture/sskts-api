"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const express = require("express");
let router = express.Router();
const authentication4transaction_1 = require("../middlewares/authentication4transaction");
const owner_1 = require("../../domain/repository/interpreter/owner");
const transaction_1 = require("../../domain/repository/interpreter/transaction");
const transaction_2 = require("../../domain/service/interpreter/transaction");
const Authorization = require("../../domain/model/Authorization");
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
        let authorization = new Authorization.GMO(mongoose.Types.ObjectId().toString(), "gmo_test_order_id");
        yield transaction_2.default.addGMOAuthorization(req.params.id, authorization)(transaction_1.default);
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
