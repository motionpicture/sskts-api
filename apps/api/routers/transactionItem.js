"use strict";
const express = require("express");
let router = express.Router();
const authentication4transaction_1 = require("../middlewares/authentication4transaction");
const transactionItemController = require("../controllers/transactionItem");
router.post("/transactionItem/create/reservation", authentication4transaction_1.default, (req, res, next) => {
    req.checkBody("reservations").notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        // 座席予約パラメータの型をチェック
        if (!Array.isArray(req.body.reservations))
            return next(new Error("parameter \"reservations\" must be an array."));
        if (req.body.reservations.length === 0)
            return next(new Error("reservations length must be over 0."));
        let reservations4args = req.body.reservations.map((reservation) => {
            return {
                performance: (reservation.performance) ? reservation.performance : null,
                seat_code: (reservation.seat_code) ? reservation.seat_code : null
            };
        });
        transactionItemController.create4reservation({
            transaction_id: req.body.transaction_id,
            reservations: reservations4args
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
