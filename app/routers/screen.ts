/**
 * screenルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import validator from '../middlewares/validator';

router.use(authentication);

router.get(
    '/:id',
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findScreen(req.params.id)(sskts.adapter.screen(mongoose.connection));
            option.match({
                Some: (screen) => {
                    res.json({
                        data: {
                            type: 'screens',
                            id: screen.id,
                            attributes: screen
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
