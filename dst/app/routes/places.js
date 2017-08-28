"use strict";
/**
 * 場所ルーター
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
const placesRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const http_status_1 = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
placesRouter.use(authentication_1.default);
placesRouter.get('/movieTheater/:branchCode', permitScopes_1.default(['places', 'places.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.place.findMovieTheaterByBranchCode(req.params.branchCode)(sskts.adapter.place(sskts.mongoose.connection)).then((option) => {
            option.match({
                Some: (theater) => {
                    res.json({
                        data: theater
                    });
                },
                None: () => {
                    res.status(http_status_1.NOT_FOUND);
                    next(new Error('movieTheater not found'));
                }
            });
        });
    }
    catch (error) {
        next(error);
    }
}));
placesRouter.get('/movieTheater', permitScopes_1.default(['places', 'places.read-only']), validator_1.default, (__, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const places = yield sskts.service.place.searchMovieTheaters({})(sskts.adapter.place(sskts.mongoose.connection));
        res.json({
            data: places
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = placesRouter;
