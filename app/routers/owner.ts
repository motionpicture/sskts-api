/**
 * 会員ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const ownerRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { CREATED, NO_CONTENT, NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:ownerRouter');

ownerRouter.use(authentication);
ownerRouter.use(requireMember);

/**
 * 会員プロフィール取得
 */
ownerRouter.get(
    '/me/profile',
    permitScopes(['owners.profile', 'owners.profile.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            const memberOwnerOption = await sskts.service.member.getProfile(ownerId)(sskts.adapter.owner(mongoose.connection));
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
                    res.status(NOT_FOUND);
                    res.json({
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員プロフィール更新
 */
ownerRouter.put(
    '/me/profile',
    permitScopes(['owners.profile']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            const update = sskts.factory.owner.member.createVariableFields({
                name_first: req.body.name_first,
                name_last: req.body.name_last,
                email: req.body.email,
                tel: req.body.tel
            });
            await sskts.service.member.updateProfile(ownerId, update)(sskts.adapter.owner(mongoose.connection));

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード取得
 */
ownerRouter.get(
    '/me/cards',
    permitScopes(['owners.cards', 'owners.cards.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            const data = await sskts.service.member.findCards(ownerId)()
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
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード追加
 */
ownerRouter.post(
    '/me/cards',
    permitScopes(['owners.cards']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            await sskts.service.member.addCard(ownerId, {
                card_no: req.body.card_no,
                card_pass: req.body.card_pass,
                expire: req.body.expire,
                holder_name: req.body.holder_name,
                group: sskts.factory.cardGroup.GMO
            })();

            res.status(CREATED).json({
                data: {
                    type: 'cards',
                    attributes: {}
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員カード削除
 */
ownerRouter.delete(
    '/me/cards',
    permitScopes(['owners.cards']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            await sskts.service.member.removeCard(ownerId, req.body.card_seq)();

            res.status(NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 会員座席予約資産取得
 */
ownerRouter.get(
    '/me/assets/seatReservation',
    permitScopes(['owners.assets', 'owners.assets.read-only']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ownerId = (<Express.IOwner>req.getUser().owner).id;
            const data = await sskts.service.member.findSeatReservationAssets(ownerId)(sskts.adapter.asset(mongoose.connection))
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
        } catch (error) {
            next(error);
        }
    }
);

export default ownerRouter;
