"use strict";
/**
 * performanceルーター
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const redis = require("../../redis");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
performanceRouter.use(authentication_1.default);
performanceRouter.get('/:id', permitScopes_1.default(['admin', 'performances', 'performances.read-only']), (_1, _2, next) => {
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
                res.status(http_status_1.NOT_FOUND);
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
performanceRouter.get('', permitScopes_1.default(['admin', 'performances', 'performances.read-only']), (req, _, next) => {
    req.checkQuery('theater', 'invalid theater').notEmpty().withMessage('theater is required');
    req.checkQuery('day', 'invalid day').notEmpty().withMessage('day is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const performanceAdapter = sskts.adapter.performance(mongoose.connection);
        const performanceStockStatusAdapter = sskts.adapter.stockStatus.performance(redis.getClient());
        const performances = yield sskts.service.master.searchPerformances({
            day: req.query.day,
            theater: req.query.theater
        })(performanceAdapter, performanceStockStatusAdapter);
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
exports.default = performanceRouter;
