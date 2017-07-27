"use strict";
/**
 * 会員ルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const peopleRouter = express_1.Router();
// import * as sskts from '@motionpicture/sskts-domain';
// import * as createDebug from 'debug';
// import { CREATED, NO_CONTENT, NOT_FOUND } from 'http-status';
const authentication_1 = require("../middlewares/authentication");
// import permitScopes from '../middlewares/permitScopes';
const requireMember_1 = require("../middlewares/requireMember");
// import validator from '../middlewares/validator';
// const debug = createDebug('sskts-api:peopleRouter');
peopleRouter.use(authentication_1.default);
peopleRouter.use(requireMember_1.default);
/**
 * 会員プロフィール取得
 */
// peopleRouter.get(
//     '/me/profile',
//     permitScopes(['owners.profile', 'owners.profile.read-only']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             const profileOption = await sskts.service.member.getProfile(ownerId)(sskts.adapter.owner(sskts.mongoose.connection));
//             debug('profileOption is', profileOption);
//             profileOption.match({
//                 Some: (profile) => {
//                     res.json({
//                         data: {
//                             type: 'owners',
//                             id: ownerId,
//                             attributes: profile
//                         }
//                     });
//                 },
//                 None: () => {
//                     res.status(NOT_FOUND);
//                     res.json({
//                         data: null
//                     });
//                 }
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員プロフィール更新
 */
// peopleRouter.put(
//     '/me/profile',
//     permitScopes(['owners.profile']),
//     (req, __, next) => {
//         /*
//         req.body = {
//             data: {
//                 type: 'owners',
//                 id: '1',
//                 attributes: {
//                     name_first: 'xxx',
//                     name_last: 'xxx',
//                     email: 'xxx',
//                     tel: 'xxx'
//                 }
//             }
//         }
//         */
//         const ownerId = <string>req.getUser().owner;
//         req.checkBody('data').notEmpty().withMessage('required');
//         req.checkBody('data.type').equals('owners').withMessage('must be \'owners\'');
//         req.checkBody('data.id').equals(ownerId).withMessage('must be yourself');
//         req.checkBody('data.attributes').notEmpty().withMessage('required');
//         req.checkBody('data.attributes.name_first').notEmpty().withMessage('required');
//         req.checkBody('data.attributes.name_last').notEmpty().withMessage('required');
//         req.checkBody('data.attributes.email').notEmpty().withMessage('required').isEmail().withMessage('should be an email');
//         req.checkBody('data.attributes.tel').notEmpty().withMessage('required');
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             const profile = sskts.factory.owner.member.createVariableFields(req.body.data.attributes);
//             await sskts.service.member.updateProfile(ownerId, profile)(sskts.adapter.owner(sskts.mongoose.connection));
//             res.status(NO_CONTENT).end();
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員カード取得
 */
// peopleRouter.get(
//     '/me/cards',
//     permitScopes(['owners.cards', 'owners.cards.read-only']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             const data = await sskts.service.member.findCards(ownerId)()
//                 .then((cards) => {
//                     return cards.map((card) => {
//                         return {
//                             type: 'cards',
//                             id: card.id.toString(),
//                             attributes: { ...card, ...{ id: undefined } }
//                         };
//                     });
//                 });
//             res.json({
//                 data: data
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員カード追加
 */
// peopleRouter.post(
//     '/me/cards',
//     permitScopes(['owners.cards']),
//     (req, _2, next) => {
//         /*
//         req.body = {
//             data: {
//                 type: 'cards',
//                 attributes: {
//                     card_no: 'xxx',
//                     card_pass: 'xxx',
//                     expire: 'xxx',
//                     holder_name: 'xxx'
//                 }
//             }
//         }
//         */
//         req.checkBody('data').notEmpty().withMessage('required');
//         req.checkBody('data.type').equals('cards').withMessage('must be \'cards\'');
//         req.checkBody('data.attributes').notEmpty().withMessage('required');
//         req.checkBody('data.attributes.card_no').optional().notEmpty().withMessage('required');
//         // req.checkBody('data.attributes.card_pass').optional().notEmpty().withMessage('required');
//         req.checkBody('data.attributes.expire').optional().notEmpty().withMessage('required');
//         req.checkBody('data.attributes.holder_name').optional().notEmpty().withMessage('required');
//         req.checkBody('data.attributes.token').optional().notEmpty().withMessage('required');
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             // 生のカード情報の場合
//             const card = sskts.factory.card.gmo.createUncheckedCardRaw(req.body.data.attributes);
//             const addedCard = await sskts.service.member.addCard(ownerId, card)();
//             res.status(CREATED).json({
//                 data: {
//                     type: 'cards',
//                     id: addedCard.id.toString(),
//                     attributes: { ...addedCard, ...{ id: undefined } }
//                 }
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員カード削除
 */
// peopleRouter.delete(
//     '/me/cards/:id',
//     permitScopes(['owners.cards']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             await sskts.service.member.removeCard(ownerId, req.params.id)();
//             res.status(NO_CONTENT).end();
//         } catch (error) {
//             next(error);
//         }
//     }
// );
/**
 * 会員座席予約資産取得
 */
// peopleRouter.get(
//     '/me/assets/seatReservation',
//     permitScopes(['owners.assets', 'owners.assets.read-only']),
//     (_1, _2, next) => {
//         next();
//     },
//     validator,
//     async (req, res, next) => {
//         try {
//             const ownerId = <string>req.getUser().owner;
//             const data = await sskts.service.member.findSeatReservationAssets(ownerId)(sskts.adapter.asset(sskts.mongoose.connection))
//                 .then((assets) => {
//                     return assets.map((asset) => {
//                         return {
//                             type: 'assets',
//                             id: asset.id,
//                             attributes: asset
//                         };
//                     });
//                 });
//             res.json({
//                 data: data
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// );
exports.default = peopleRouter;
