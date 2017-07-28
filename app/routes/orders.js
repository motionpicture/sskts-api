"use strict";
/**
 * 注文ルーター
 *
 * @module ordersRouter
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
const ordersRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const httpStatus = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
ordersRouter.use(authentication_1.default);
/**
 * 注文照会
 */
ordersRouter.post('/findByOrderInquiryKey', permitScopes_1.default(['admin', 'orders', 'orders.read-only']), (req, _, next) => {
    req.checkBody('theaterCode', 'invalid theaterCode').notEmpty().withMessage('theaterCode is required');
    req.checkBody('orderNumber', 'invalid orderNumber').notEmpty().withMessage('orderNumber is required');
    req.checkBody('telephone', 'invalid telephone').notEmpty().withMessage('telephone is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const key = sskts.factory.orderInquiryKey.create({
            theaterCode: req.body.theaterCode,
            orderNumber: req.body.orderNumber,
            telephone: req.body.telephone
        });
        yield sskts.service.order.findByOrderInquiryKey(key)(sskts.adapter.order(sskts.mongoose.connection))
            .then((option) => {
            option.match({
                Some: (order) => {
                    res.json({
                        data: order
                    });
                },
                None: () => {
                    res.status(httpStatus.NOT_FOUND).json({
                        data: null
                    });
                }
            });
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ordersRouter;
