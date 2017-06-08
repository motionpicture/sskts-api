/**
 * theaterルーター
 *
 * @ignore
 */

import { Router } from 'express';
const theaterRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

theaterRouter.use(authentication);

const debug = createDebug('sskts-api:*');

theaterRouter.get(
    '/:id',
    permitScopes(['admin']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findTheater(req.params.id)(sskts.adapter.theater(mongoose.connection));
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
                    res.status(NOT_FOUND);
                    res.json({
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    });

theaterRouter.get(
    '',
    permitScopes(['admin']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (__, res, next) => {
        try {
            const theaterAdapter = sskts.adapter.theater(mongoose.connection);
            const theaters = await sskts.service.master.searchTheaters({
            })(theaterAdapter);

            const data = theaters.map((theater) => {
                return {
                    type: 'theaters',
                    id: theater.id,
                    attributes: theater
                };
            });

            res.json({
                data: data
            });
        } catch (error) {
            next(error);
        }
    }
);

export default theaterRouter;
