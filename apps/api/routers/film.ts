import express = require('express')
let router = express.Router();

import * as filmController from "../controllers/film";
router.get("/films", (req, res, next) => {
    req.checkQuery("theater_code").notEmpty();

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }

        filmController.find(req.query.theater_code).then((films) => {
            res.json({
                success: true,
                films: films
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