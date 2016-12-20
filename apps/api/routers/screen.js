"use strict";
const express_1 = require("express");
let router = express_1.Router();
const screenController = require("../controllers/screen");
router.get("/screens", (req, res, next) => {
    req.checkQuery("theater_code", "theater_code required.").notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }
        screenController.find(req.query.theater_code).then((screens) => {
            res.json({
                success: true,
                screens: screens
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
