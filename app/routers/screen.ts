/**
 * screenルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();

import * as sskts from '@motionpicture/sskts-domain';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

import authentication from '../middlewares/authentication';

router.use(authentication);

router.get('/:id', async (req, res, next) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const option = await sskts.service.master.findScreen(req.params.id)(sskts.createScreenAdapter(mongoose.connection));
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
                res.status(HTTPStatus.NOT_FOUND);
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
