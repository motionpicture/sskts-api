/**
 * 組織ルーター
 *
 * @ignore
 */

import { Router } from 'express';
import { NOT_FOUND } from 'http-status';
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
            await sskts.service.organization.findMovieTheaterByBranchCode(req.params.branchCode)(
                sskts.adapter.organization(sskts.mongoose.connection)
            ).then((option) => {
                option.match({
                    Some: (movieTheater) => {
                        res.json({
                            data: movieTheater
                        });
                    },
                    None: () => {
                        res.status(NOT_FOUND);
                        next(new Error('movieTheater not found'));
                    }
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
