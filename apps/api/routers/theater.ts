import express = require('express')
let router = express.Router();
import TheaterRepository from "../../domain/repository/interpreter/theater";

router.get("/theater/:code", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) return next(new Error(result.array()[0].msg));

        TheaterRepository.find(req.params.code).then((theater) => {
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

export default router;