"use strict";
/**
 * 組織ルーター
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
const http_status_1 = require("http-status");
const organizationsRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
organizationsRouter.use(authentication_1.default);
organizationsRouter.get('/movieTheater/:branchCode', permitScopes_1.default(['organizations', 'organizations.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.organization.findMovieTheaterByBranchCode(req.params.branchCode)(sskts.adapter.organization(sskts.mongoose.connection)).then((option) => {
            option.match({
                Some: (movieTheater) => {
                    res.json({
                        data: movieTheater
                    });
                },
                None: () => {
                    res.status(http_status_1.NOT_FOUND).json({
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
organizationsRouter.get('/movieTheater', permitScopes_1.default(['organizations', 'organizations.read-only']), validator_1.default, (__, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const movieTheaters = yield sskts.service.organization.searchMovieTheaters({})(sskts.adapter.organization(sskts.mongoose.connection));
        res.json({
            data: movieTheaters
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = organizationsRouter;
