/**
 * タスクルーター
 */
import * as cinerino from '@motionpicture/sskts-domain';
import { Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
import { body, query } from 'express-validator/check';
import { CREATED } from 'http-status';
import * as moment from 'moment';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const tasksRouter = Router();
tasksRouter.use(authentication);

/**
 * タスク作成
 */
tasksRouter.post(
    '/:name',
    permitScopes(['admin']),
    ...[
        body('runsAt').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isISO8601(),
        body('remainingNumberOfTries').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
            .isInt(),
        body('data').not().isEmpty().withMessage((_, options) => `${options.path} is required`)
    ],
    validator,
    async (req, res, next) => {
        try {
            const taskRepo = new cinerino.repository.Task(cinerino.mongoose.connection);
            const attributes: cinerino.factory.task.IAttributes<cinerino.factory.taskName> = {
                name: req.params.name,
                status: cinerino.factory.taskStatus.Ready,
                runsAt: moment(req.body.runsAt).toDate(),
                remainingNumberOfTries: Number(req.body.remainingNumberOfTries),
                lastTriedAt: null,
                numberOfTried: 0,
                executionResults: [],
                data: req.body.data
            };
            const task = await taskRepo.save(attributes);
            res.status(CREATED).json(task);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * タスク確認
 */
tasksRouter.get(
    '/:name/:id',
    permitScopes(['admin']),
    validator,
    async (req, res, next) => {
        try {
            const taskRepo = new cinerino.repository.Task(cinerino.mongoose.connection);
            const task = await taskRepo.findById({
                name: req.params.name,
                id: req.params.id
            });
            res.json(task);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * タスク検索
 */
tasksRouter.get(
    '',
    permitScopes(['admin']),
    ...[
        query('runsFrom').optional().isISO8601().withMessage((_, options) => `${options.path} must be ISO8601 timestamp`),
        query('runsThrough').optional().isISO8601().withMessage((_, options) => `${options.path} must be ISO8601 timestamp`),
        query('lastTriedFrom').optional().isISO8601().withMessage((_, options) => `${options.path} must be ISO8601 timestamp`),
        query('lastTriedThrough').optional().isISO8601().withMessage((_, options) => `${options.path} must be ISO8601 timestamp`)
    ],
    validator,
    async (req, res, next) => {
        try {
            const taskRepo = new cinerino.repository.Task(cinerino.mongoose.connection);
            const searchConditions: cinerino.factory.task.ISearchConditions<cinerino.factory.taskName> = {
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                sort: (req.query.sort !== undefined) ? req.query.sort : { runsAt: cinerino.factory.sortType.Descending },
                name: req.query.name,
                statuses: (Array.isArray(req.query.statuses)) ? req.query.statuses : undefined,
                runsFrom: (req.query.runsFrom !== undefined) ? moment(req.query.runsFrom).toDate() : undefined,
                runsThrough: (req.query.runsThrough !== undefined) ? moment(req.query.runsThrough).toDate() : undefined,
                lastTriedFrom: (req.query.lastTriedFrom !== undefined) ? moment(req.query.lastTriedFrom).toDate() : undefined,
                lastTriedThrough: (req.query.lastTriedThrough !== undefined) ? moment(req.query.lastTriedThrough).toDate() : undefined
            };
            const tasks = await taskRepo.search(searchConditions);
            const totalCount = await taskRepo.count(searchConditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    }
);

export default tasksRouter;
