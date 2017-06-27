/**
 * 会員ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const ownerRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import requireMember from '../middlewares/requireMember';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:ownerRouter');

ownerRouter.use(authentication);
ownerRouter.use(requireMember);

ownerRouter.get(
    '/me',
    permitScopes(['owners', 'owners:read-only']),
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

export default ownerRouter;
