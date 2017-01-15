"use strict";
const express_1 = require("express");
let router = express_1.Router();
const screen_1 = require("../../domain/repository/interpreter/screen");
router.get("/screen/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
        screen_1.default.findById(req.params.id).then((screen) => {
            res.json({
                success: true,
                message: "",
                screen: screen
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
