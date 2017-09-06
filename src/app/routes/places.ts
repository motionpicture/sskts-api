/**
 * 場所ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const placesRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

placesRouter.use(authentication);

placesRouter.get(
    '/movieTheater/:branchCode',
    permitScopes(['places', 'places.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const repository = new sskts.repository.Place(sskts.mongoose.connection);
            await repository.findMovieTheaterByBranchCode(req.params.branchCode).then((theater) => {
                res.json({
                    data: theater
                });
            });
        } catch (error) {
            next(error);
        }
    });

placesRouter.get(
    '/movieTheater',
    permitScopes(['places', 'places.read-only']),
    validator,
    async (__, res, next) => {
        try {
            const repository = new sskts.repository.Place(sskts.mongoose.connection);
            await repository.searchMovieTheaters({}).then((places) => {
                res.json({
                    data: places
                });
            });
        } catch (error) {
            next(error);
        }
    }
);

export default placesRouter;
