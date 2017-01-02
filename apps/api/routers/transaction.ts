import express = require('express')
let router = express.Router();

import authentication4transaction from "../middlewares/authentication4transaction";
import * as transactionController from "../controllers/transaction";
// import * as authorizationController from "../controllers/authorization";

router.get("/transactions", (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/start", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        transactionController.create().then((transaction) => {
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

router.all("/transaction/:id/publishPaymentNo", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/:id/close", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/:id/authorize", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/:id/unauthorize", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

export default router;