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
const router = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const HTTPStatus = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
router.use(authentication_1.default);
router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // req.checkQuery('theater_code', 'theater_code required.').notEmpty();
    const validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }
    try {
        const option = yield sskts.service.master.findFilm(req.params.id)(sskts.createFilmRepository(mongoose.connection));
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
exports.default = router;
