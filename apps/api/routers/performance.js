"use strict";
const express_1 = require("express");
let router = express_1.Router();
const performanceController = require("../controllers/performance");
router.get("/performance/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }
        performanceController.findById(req.params.id).then((performance) => {
            res.json({
                success: true,
                performance: performance
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
router.get("/performances", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        performanceController.find({
            day: req.query.day,
            theater: req.query.theater,
        }).then((performances) => {
            res.json({
                success: true,
                performances: performances
            });
        }, (err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
router.get("/performance/:id/assets", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }
        performanceController.getAssets(req.params.id).then((assets) => {
            res.json({
                success: true,
                assets: assets
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
