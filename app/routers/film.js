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
 * filmルーター
 *
 * @ignore
 */
const express_1 = require("express");
const filmRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
filmRouter.use(authentication_1.default);
filmRouter.get('/:id', permitScopes_1.default(['admin']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const option = yield sskts.service.master.findFilm(req.params.id)(sskts.adapter.film(mongoose.connection));
        option.match({
            Some: (film) => {
                res.json({
                    data: {
                        type: 'films',
                        id: film.id,
                        attributes: film
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
exports.default = filmRouter;
