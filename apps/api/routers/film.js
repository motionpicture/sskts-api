"use strict";
const express_1 = require("express");
let router = express_1.Router();
const filmController = require("../controllers/film");
router.get("/film/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        filmController.findById(req.params.id).then((film) => {
            res.json({
                success: true,
                film: film
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
