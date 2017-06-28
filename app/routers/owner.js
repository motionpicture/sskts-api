"use strict";
/**
 * 会員ルーター
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
const ownerRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const requireMember_1 = require("../middlewares/requireMember");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('sskts-api:ownerRouter');
ownerRouter.use(authentication_1.default);
ownerRouter.use(requireMember_1.default);
ownerRouter.get('/me', permitScopes_1.default(['owners', 'owners:read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        const memberOwnerOption = yield sskts.service.member.getProfile(ownerId)(sskts.adapter.owner(mongoose.connection));
        debug('memberOwnerOption is', memberOwnerOption);
        memberOwnerOption.match({
            Some: (memberOwner) => {
                res.json({
                    data: {
                        type: 'owners',
                        id: ownerId,
                        attributes: memberOwner
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
ownerRouter.put('/me', permitScopes_1.default(['owners']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        const update = sskts.factory.owner.member.createVariableFields({
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            email: req.body.email,
            tel: req.body.tel
        });
        yield sskts.service.member.updateProfile(ownerId, update)(sskts.adapter.owner(mongoose.connection));
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ownerRouter;
