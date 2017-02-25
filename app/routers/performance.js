"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * performanceルーター
 *
 * @ignore
 */
const express_1 = require("express");
const router = express_1.Router();
const SSKTS = require("@motionpicture/sskts-domain");
const HTTPStatus = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
router.use(authentication_1.default);
router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const option = yield SSKTS.MasterService.findPerformance(req.params.id)(SSKTS.createPerformanceRepository(mongoose.connection));
        option.match({
            Some: (performance) => {
                res.json({
                    data: {
                        type: 'performances',
                        id: performance.id,
                        attributes: performance
                    }
                });
            },
            None: () => {
                res.status(HTTPStatus.NOT_FOUND);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get('', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const performances = yield SSKTS.MasterService.searchPerformances({
            day: req.query.day,
            theater: req.query.theater
        })(SSKTS.createPerformanceRepository(mongoose.connection));
        const data = performances.map((performance) => {
            return {
                type: 'performances',
                id: performance.id,
                attributes: performance
            };
        });
        res.json({
            data: data
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
