"use strict";
const express_1 = require("express");
let router = express_1.Router();
const performance_1 = require("../../domain/repository/interpreter/performance");
router.get("/performance/:id", (req, res, next) => {
    req.getValidationResult().then((result) => {
        if (!result.isEmpty())
            return next(new Error(result.array()[0].msg));
        performance_1.default.findById(req.params.id).then((performance) => {
            res.json({
                success: true,
                message: "",
                performance: performance
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
