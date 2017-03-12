/**
 * theaterルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import validator from '../middlewares/validator';

router.use(authentication);

const debug = createDebug('sskts-api:*');

router.get(
    '/:id',
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findTheater(req.params.id)(sskts.createTheaterAdapter(mongoose.connection));
            debug('option is', option);
            option.match({
                Some: (theater) => {
                    res.json({
                        data: {
                            type: 'theaters',
                            id: theater.id,
                            attributes: theater
                        }
                    });
                },
                None: () => {
                    res.status(httpStatus.NOT_FOUND);
                    res.json({
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    });

export default router;
