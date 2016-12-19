import express = require('express')
let router = express.Router();

import * as filmController from "../controllers/film";
router.get("/films", (req, res, next) => {
    filmController.find(req.query.theater_code).then((films) => {
        res.json({
            success: true,
            films: films
        });
    }, (err) => {
        res.json({
            success: false,
            message: err.message,
        });
    });
});

export default router;