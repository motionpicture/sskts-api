"use strict";
const express = require("express");
let router = express.Router();
const theaterController = require("../controllers/theater");
router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        theaterController.findByCode(req.params.code).then((theater) => {
            res.json({
                success: true,
                message: null,
                theater: theater
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
