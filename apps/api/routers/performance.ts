import { Router } from "express";
let router = Router();

import * as performanceController from "../controllers/performance";
router.get("/performance/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

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
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

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

export default router;