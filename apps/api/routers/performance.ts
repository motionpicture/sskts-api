import {Router} from "express";
let router = Router();

import * as performanceController from "../controllers/performance";
router.get("/performances", (req, res, next) => {
    req.checkQuery("theater_code", "theater_code required.").notEmpty();

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }

        performanceController.find(req.query.theater_code).then((performances) => {
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