import express = require('express')
let router = express.Router();

import * as transactionController from "../controllers/transaction";
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

router.all("/transaction/:id/publishPaymentNo", (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/:id/close", (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

router.all("/transaction/:id/update", (req, res, next) => {
    req.getValidationResult().then((result) => {
        res.json({
            success: false,
            message: "now coding..."
        });
    });
});

export default router;