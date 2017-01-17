"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express_1 = require("express");
let router = express_1.Router();
const performance_1 = require("../../domain/repository/interpreter/performance");
const performance_2 = require("../../domain/service/interpreter/performance");
router.get("/performance/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let option = yield performance_1.default.findById(req.params.id);
        option.match({
            Some: (performance) => {
                res.json({
                    success: true,
                    message: "",
                    performance: performance
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    success: true,
                    message: "not found.",
                    performance: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/performances", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let performances = yield performance_2.default.search({
            day: req.query.day,
            theater: req.query.theater,
        })(performance_1.default);
        res.json({
            success: true,
            message: "",
            performances: performances
        });
    }
    catch (error) {
        next(error);
    }
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
