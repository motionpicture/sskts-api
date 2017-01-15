"use strict";
const express_1 = require("express");
let router = express_1.Router();
const film_1 = require("../../domain/repository/interpreter/film");
router.get("/film/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
        film_1.default.findById(req.params.id).then((film) => {
            res.json({
                success: true,
                message: "",
                film: film
            });
        }).catch((err) => {
            res.json({
                success: false,
                message: err.message
            });
        });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
