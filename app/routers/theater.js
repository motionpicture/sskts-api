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
 * theaterルーター
 *
 * @ignore
 */
const express_1 = require("express");
const router = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
const validator_1 = require("../middlewares/validator");
router.use(authentication_1.default);
const debug = createDebug('sskts-api:*');
router.get('/:id', (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const option = yield sskts.service.master.findTheater(req.params.id)(sskts.adapter.theater(mongoose.connection));
        debug('option is', option);
        option.match({
            Some: (theater) => {
                res.json({
                    data: {
                        type: 'theaters',
                        id: theater.id,
                        attributes: theater
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
exports.default = router;
