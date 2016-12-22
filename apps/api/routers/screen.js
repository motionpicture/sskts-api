"use strict";
const express_1 = require("express");
let router = express_1.Router();
const screenController = require("../controllers/screen");
router.get("/screen/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            return next(new Error(result.useFirstErrorOnly().array().pop().msg));
        }
        screenController.findById(req.params.id).then((screen) => {
            res.json({
                success: true,
                screen: screen
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
