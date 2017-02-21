import { Router } from 'express';
let router = Router();
import * as SSKTS from '@motionpicture/sskts-domain';
import mongoose = require('mongoose');

router.get('/:id', async (req, res, next) => {
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let option = await SSKTS.MasterService.findPerformance(req.params.id)(SSKTS.createPerformanceRepository(mongoose.connection));
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
                res.status(404);
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
    let validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) return next(new Error(validatorResult.array()[0].msg));

    try {
        let performances = await SSKTS.MasterService.searchPerformances({
            day: req.query.day,
            theater: req.query.theater,
        })(SSKTS.createPerformanceRepository(mongoose.connection));

        let data = performances.map((performance) => {
            return {
                type: 'performances',
                _id: performance._id,
                attributes: performance
            }
        });

        res.json({
            data: data,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
