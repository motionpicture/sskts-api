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
const sskts = require("@motionpicture/sskts-domain");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
const validator_1 = require("../middlewares/validator");
router.use(authentication_1.default);
router.get('/:id', (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const option = yield sskts.service.master.findPerformance(req.params.id)(sskts.adapter.performance(mongoose.connection));
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
                res.status(httpStatus.NOT_FOUND);
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
router.get('', (req, _, next) => {
    req.checkQuery('theater', 'invalid theater').notEmpty().withMessage('theater is required');
    req.checkQuery('day', 'invalid day').notEmpty().withMessage('day is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const performances = yield sskts.service.master.searchPerformances({
            day: req.query.day,
            theater: req.query.theater
        })(sskts.adapter.performance(mongoose.connection));
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
