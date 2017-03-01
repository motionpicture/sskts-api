/**
 * performanceルーター
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
        const option = await sskts.service.master.findPerformance(req.params.id)(sskts.createPerformanceRepository(mongoose.connection));
        option.match({
            Some: (performance) => {
                res.json({
                    data: {
                        type: 'performances',
                        id: performance.id,
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
        const performances = await sskts.service.master.searchPerformances({
            day: req.query.day,
            theater: req.query.theater
        })(sskts.createPerformanceRepository(mongoose.connection));

        const data = performances.map((performance) => {
            return {
                type: 'performances',
                id: performance.id,
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
