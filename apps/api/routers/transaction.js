"use strict";
const express = require("express");
let router = express.Router();
const authentication4transaction_1 = require("../middlewares/authentication4transaction");
const transactionController = require("../controllers/transaction");
// import * as authorizationController from "../controllers/authorization";
router.get("/transactions", (req, res, next) => {
    req.getValidationResult().then((result) => {
        transactionController.find({}).then((transactions) => {
            res.json({
                success: true,
                message: null,
                transactions: transactions
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
router.all("/transaction/start", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        // TODO ownersの型チェック
        // let owners = ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"];
        transactionController.create(req.body.owners).then((transaction) => {
            res.json({
                success: true,
                message: null,
                transaction: transaction
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
router.all("/transaction/:id/publishPaymentNo", authentication4transaction_1.default, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});
router.all("/transaction/:id/close", authentication4transaction_1.default, (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        transactionController.close(req.params.id).then((transaction) => {
            res.json({
                success: true,
                message: null,
                transaction: transaction
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
router.all("/transaction/:id/authorize", authentication4transaction_1.default, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});
router.all("/transaction/:id/unauthorize", authentication4transaction_1.default, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
