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
        const ownerId = req.getUser().owner;
        const profileOption = yield sskts.service.member.getProfile(ownerId)(sskts.adapter.owner(sskts.mongoose.connection));
        debug('profileOption is', profileOption);
        profileOption.match({
            Some: (profile) => {
                res.json({
                    data: {
                        type: 'owners',
                        id: ownerId,
                        attributes: profile
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
ownerRouter.put('/me/profile', permitScopes_1.default(['owners.profile']), (req, __, next) => {
    /*
    req.body = {
        data: {
            type: 'owners',
            id: '1',
            attributes: {
                name_first: 'xxx',
                name_last: 'xxx',
                email: 'xxx',
                tel: 'xxx'
            }
        }
    }
    */
    const ownerId = req.getUser().owner;
    req.checkBody('data').notEmpty().withMessage('required');
    req.checkBody('data.type').equals('owners').withMessage('must be \'owners\'');
    req.checkBody('data.id').equals(ownerId).withMessage('must be yourself');
    req.checkBody('data.attributes').notEmpty().withMessage('required');
    req.checkBody('data.attributes.name_first').notEmpty().withMessage('required');
    req.checkBody('data.attributes.name_last').notEmpty().withMessage('required');
    req.checkBody('data.attributes.email').notEmpty().withMessage('required').isEmail().withMessage('should be an email');
    req.checkBody('data.attributes.tel').notEmpty().withMessage('required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner;
        const profile = sskts.factory.owner.member.createVariableFields(req.body.data.attributes);
        yield sskts.service.member.updateProfile(ownerId, profile)(sskts.adapter.owner(sskts.mongoose.connection));
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
        const ownerId = req.getUser().owner;
        const data = yield sskts.service.member.findCards(ownerId)()
            .then((cards) => {
            return cards.map((card) => {
                return {
                    type: 'cards',
                    id: card.id.toString(),
                    attributes: Object.assign({}, card, { id: undefined })
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
ownerRouter.post('/me/cards', permitScopes_1.default(['owners.cards']), (req, _2, next) => {
    /*
    req.body = {
        data: {
            type: 'cards',
            attributes: {
                card_no: 'xxx',
                card_pass: 'xxx',
                expire: 'xxx',
                holder_name: 'xxx'
            }
        }
    }
    */
    req.checkBody('data').notEmpty().withMessage('required');
    req.checkBody('data.type').equals('cards').withMessage('must be \'cards\'');
    req.checkBody('data.attributes').notEmpty().withMessage('required');
    req.checkBody('data.attributes.card_no').optional().notEmpty().withMessage('required');
    // req.checkBody('data.attributes.card_pass').optional().notEmpty().withMessage('required');
    req.checkBody('data.attributes.expire').optional().notEmpty().withMessage('required');
    req.checkBody('data.attributes.holder_name').optional().notEmpty().withMessage('required');
    req.checkBody('data.attributes.token').optional().notEmpty().withMessage('required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner;
        // 生のカード情報の場合
        const card = sskts.factory.card.gmo.createUncheckedCardRaw(req.body.data.attributes);
        const addedCard = yield sskts.service.member.addCard(ownerId, card)();
        res.status(http_status_1.CREATED).json({
            data: {
                type: 'cards',
                id: addedCard.id.toString(),
                attributes: Object.assign({}, addedCard, { id: undefined })
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
ownerRouter.delete('/me/cards/:id', permitScopes_1.default(['owners.cards']), (_1, _2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ownerId = req.getUser().owner;
        yield sskts.service.member.removeCard(ownerId, req.params.id)();
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
        const ownerId = req.getUser().owner;
        const data = yield sskts.service.member.findSeatReservationAssets(ownerId)(sskts.adapter.asset(sskts.mongoose.connection))
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
