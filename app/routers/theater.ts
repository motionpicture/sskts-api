/**
 * theaterルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();
import * as SSKTS from '@motionpicture/sskts-domain';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

router.get('/:code', async (req, res, next) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const option = await SSKTS.MasterService.findTheater(req.params.id)(SSKTS.createTheaterRepository(mongoose.connection));
        option.match({
            Some: (theater) => {
                res.json({
                    data: {
                        type: 'theaters',
                        _id: theater._id,
                        attributes: theater
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
