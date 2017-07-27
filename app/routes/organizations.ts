/**
 * 組織ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const organizationsRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

organizationsRouter.use(authentication);

organizationsRouter.get(
    '/movieTheater',
    permitScopes(['admin', 'organizations', 'organizations.read-only']),
    validator,
    async (__, res, next) => {
        try {
            const movieTheaters = await sskts.service.organization.searchMovieTheaters({
            })(sskts.adapter.organization(sskts.mongoose.connection));

            res.json({
                data: movieTheaters
            });
        } catch (error) {
            next(error);
        }
    }
);

export default organizationsRouter;
