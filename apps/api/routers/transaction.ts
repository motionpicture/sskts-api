import express = require('express')
let router = express.Router();

import authentication4transaction from "../middlewares/authentication4transaction";
import * as TransactionController from "../controllers/transaction";
import * as AuthorizationController from "../controllers/authorization";

router.get("/transactions", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

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

router.post("/transaction/start", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

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

router.post("/transaction/:id/close", authentication4transaction, (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

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

router.post("/transaction/:id/authorize", authentication4transaction, (req, res, next) => {
    // TODO validations

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        AuthorizationController.create({
            transaction: req.params.id,
            group: req.body.authorization_group,
            authorizations: req.body.authorizations,
        }).then((results) => {
            res.json({
                success: true,
                message: null,
                results: results
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

router.post("/transaction/:id/unauthorize", authentication4transaction, (req, res, next) => {
    // TODO validations

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        AuthorizationController.remove({
            transaction: req.params.id,
            authorizations: req.body.authorizations,
        }).then((results) => {
            res.json({
                success: true,
                message: null,
                results: results
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});

router.post("/transaction/:id/update", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        let args = {
            _id: req.params.id,
            expired_at: (req.body.expired_at) ? new Date(parseInt(req.body.expired_at) * 1000) : undefined,
            access_id: (req.body.access_id) ? req.body.access_id : undefined,
            access_pass: (req.body.access_pass) ? req.body.access_pass : undefined,
        };
        TransactionController.update(args).then((transaction) => {
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

export default router;