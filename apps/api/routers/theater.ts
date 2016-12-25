import express = require('express')
let router = express.Router();

import * as theaterController from "../controllers/theater";
router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

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

router.get("/theater/:code/import", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.useFirstErrorOnly().array().pop().msg));

        theaterController.importByCode(req.params.code).then(() => {
            res.json({
                success: true,
                message: null,
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