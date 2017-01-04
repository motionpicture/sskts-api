import express = require('express')
let router = express.Router();

import authentication4transaction from "../middlewares/authentication4transaction";
import * as TransactionController from "../controllers/transaction";
import * as AuthorizationController from "../controllers/authorization";

router.get("/transactions", (req, res, next) => {
    req.getValidationResult().then((result) => {
        TransactionController.find({}).then((transactions) => {
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
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        // TODO ownersの型チェック

        // let owners = ["5868e16789cc75249cdbfa4b", "5869c2c316aaa805d835f94a"];
        TransactionController.create(req.body.owners).then((transaction) => {
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
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        TransactionController.publishPaymentNo(req.params.id).then((paymentNo) => {
            res.json({
                success: true,
                message: null,
                payment_no: paymentNo
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

router.all("/transaction/:id/close", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        TransactionController.close(req.params.id).then((transaction) => {
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

router.all("/transaction/:id/authorize", authentication4transaction, (req, res, next) => {
    // TODO validations

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        AuthorizationController.create4reservation({
            transaction: req.params.id,
            assets: req.body.assets,
        }).then((authorizations) => {
            res.json({
                success: true,
                message: null,
                authorizations: authorizations
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

router.all("/transaction/:id/unauthorize", authentication4transaction, (req, res, next) => {
    // TODO validations

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        AuthorizationController.removeByCoaTmpReserveNum({
            transaction_id: req.params.id,
            tmp_reserve_num: req.body.coa_tmp_reserve_num,
        }).then(() => {
            res.json({
                success: true,
                message: null
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

export default router;