/**
 * 場所ルーター
 *
 * @ignore
 */

import { Router } from 'express';
const placesRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

import { APIError } from '../error/api';

placesRouter.use(authentication);

placesRouter.get(
    '/movieTheater/:branchCode',
    permitScopes(['places', 'places.read-only']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.place.findMovieTheaterByBranchCode(req.params.branchCode)(
                sskts.adapter.place(sskts.mongoose.connection)
            ).then((option) => {
                option.match({
                    Some: (theater) => {
                        res.json({
                            data: theater
                        });
                    },
                    None: () => {
                        next(new APIError(NOT_FOUND, [{
                            title: 'NotFound',
                            detail: 'movieTheater not found'
                        }]));
                    }
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
            const places = await sskts.service.place.searchMovieTheaters({
            })(sskts.adapter.place(sskts.mongoose.connection));

            res.json({
                data: places
            });
        } catch (error) {
            next(error);
        }
    }
);

export default placesRouter;
