/**
 * performanceルーター
 *
 * @ignore
 */
import { Router } from 'express';
const router = Router();

import * as SSKTS from '@motionpicture/sskts-domain';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

router.get('/:id', async (req, res, next) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const option = await SSKTS.MasterService.findPerformance(req.params.id)(SSKTS.createPerformanceRepository(mongoose.connection));
        option.match({
            Some: (performance) => {
                res.json({
                    data: {
                        type: 'performances',
                        _id: performance._id,
                        attributes: performance
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

router.get('', async (req, res, next) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        return next(new Error(validatorResult.array()[0].msg));
    }

    try {
        const performances = await SSKTS.MasterService.searchPerformances({
            day: req.query.day,
            theater: req.query.theater
        })(SSKTS.createPerformanceRepository(mongoose.connection));

        const data = performances.map((performance) => {
            return {
                type: 'performances',
                _id: performance._id,
                attributes: performance
            };
        });

        res.json({
            data: data
        });
    } catch (error) {
        next(error);
    }
});

export default router;
