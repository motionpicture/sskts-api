/**
 * screenルーター
 *
 * @ignore
 */
import { Router } from 'express';
const screenRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

screenRouter.use(authentication);

screenRouter.get(
    '/:id',
    permitScopes(['admin']),
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

export default screenRouter;
