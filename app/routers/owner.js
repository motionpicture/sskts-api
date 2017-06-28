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
/**
 * 会員プロフィール取得
 */
ownerRouter.get('/me/profile', permitScopes_1.default(['owners.profile', 'owners.profile.read-only']), (_1, _2, next) => {
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
/**
 * 会員プロフィール更新
 */
ownerRouter.put('/me/profile', permitScopes_1.default(['owners.profile']), (_1, _2, next) => {
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
/**
 * 会員カード取得
 */
ownerRouter.get('/me/cards', permitScopes_1.default(['owners.cards', 'owners.cards.read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        const data = yield sskts.service.member.findCards(ownerId)()
            .then((cards) => {
            return cards.map((card) => {
                return {
                    type: 'cards',
                    attributes: card
                };
            });
        });
        res.json({
            data: data
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード追加
 */
ownerRouter.post('/me/cards', permitScopes_1.default(['owners.cards']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        yield sskts.service.member.addCard(ownerId, {
            card_no: req.body.card_no,
            card_pass: req.body.card_pass,
            expire: req.body.expire,
            holder_name: req.body.holder_name,
            group: sskts.factory.cardGroup.GMO
        })();
        res.status(http_status_1.CREATED).json({
            data: {
                type: 'cards',
                attributes: {}
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員カード削除
 */
ownerRouter.delete('/me/cards', permitScopes_1.default(['owners.cards']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        yield sskts.service.member.removeCard(ownerId, req.body.card_seq)();
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 会員座席予約資産取得
 */
ownerRouter.get('/me/assets/seatReservation', permitScopes_1.default(['owners.assets', 'owners.assets.read-only']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner.id;
        const data = yield sskts.service.member.findSeatReservationAssets(ownerId)(sskts.adapter.asset(mongoose.connection))
            .then((assets) => {
            return assets.map((asset) => {
                return {
                    type: 'assets',
                    id: asset.id,
                    attributes: asset
                };
            });
        });
        res.json({
            data: data
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = ownerRouter;
