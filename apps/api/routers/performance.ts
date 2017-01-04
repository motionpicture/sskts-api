import { Router } from "express";
let router = Router();

import * as performanceController from "../controllers/performance";
router.get("/performance/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

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
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

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
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

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

router.get("/performance/:id/tickets", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        performanceController.getTickets(req.params.id).then((tickets) => {
            res.json({
                success: true,
                tickets: tickets
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