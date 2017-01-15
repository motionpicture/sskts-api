"use strict";
const express = require("express");
let router = express.Router();
const theater_1 = require("../../domain/repository/interpreter/theater");
router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
        theater_1.default.findById(req.params.code).then((theater) => {
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
