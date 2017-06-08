/**
 * performanceルーター
 *
 * @ignore
 */
import { Router } from 'express';
const performanceRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';
import * as mongoose from 'mongoose';

import redisClient from '../../redisClient';
import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

performanceRouter.use(authentication);

performanceRouter.get(
    '/:id',
    permitScopes(['admin']),
    (_1, _2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const option = await sskts.service.master.findPerformance(req.params.id)(sskts.adapter.performance(mongoose.connection));
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

performanceRouter.get(
    '',
    permitScopes(['admin']),
    (req, _, next) => {
        req.checkQuery('theater', 'invalid theater').notEmpty().withMessage('theater is required');
        req.checkQuery('day', 'invalid day').notEmpty().withMessage('day is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const performanceAdapter = sskts.adapter.performance(mongoose.connection);
            const performanceStockStatusAdapter = sskts.adapter.stockStatus.performance(redisClient);
            const performances = await sskts.service.master.searchPerformances({
                day: req.query.day,
                theater: req.query.theater
            })(performanceAdapter, performanceStockStatusAdapter);

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
    }
);

export default performanceRouter;
