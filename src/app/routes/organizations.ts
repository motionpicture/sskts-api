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
    '/movieTheater/:branchCode',
    permitScopes(['organizations', 'organizations.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const repository = new sskts.repository.Organization(sskts.mongoose.connection);
            await repository.findMovieTheaterByBranchCode(req.params.branchCode).then((movieTheater) => {
                res.json({
                    data: movieTheater
                });
            });
        } catch (error) {
            next(error);
        }
    });

organizationsRouter.get(
    '/movieTheater',
    permitScopes(['organizations', 'organizations.read-only']),
    validator,
    async (__, res, next) => {
        try {
            const repository = new sskts.repository.Organization(sskts.mongoose.connection);
            await repository.searchMovieTheaters({
            }).then((movieTheaters) => {
                res.json({
                    data: movieTheaters
                });
            });
        } catch (error) {
            next(error);
        }
    }
);

export default organizationsRouter;
