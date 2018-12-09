/**
 * 注文返品取引ルーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
import { query } from 'express-validator/check';
import { CREATED } from 'http-status';
import * as moment from 'moment';

const returnOrderTransactionsRouter = Router();

import authentication from '../../middlewares/authentication';
import permitScopes from '../../middlewares/permitScopes';
import validator from '../../middlewares/validator';

const debug = createDebug('sskts-api:returnOrderTransactionsRouter');

returnOrderTransactionsRouter.use(authentication);

returnOrderTransactionsRouter.post(
    '/start',
    permitScopes(['admin']),
    (req, _, next) => {
        req.checkBody('expires', 'invalid expires').notEmpty().withMessage('expires is required').isISO8601();
        req.checkBody('transactionId', 'invalid transactionId').notEmpty().withMessage('transactionId is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
            const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
            const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
            const transaction = await sskts.service.transaction.returnOrder.start({
                expires: moment(req.body.expires).toDate(),
                agentId: req.user.sub,
                transactionId: req.body.transactionId,
                clientUser: req.user,
                cancellationFee: 0,
                forcibly: true,
                reason: sskts.factory.transaction.returnOrder.Reason.Seller
            })({
                action: actionRepo,
                transaction: transactionRepo,
                order: orderRepo
            });

            // tslint:disable-next-line:no-string-literal
            // const host = req.headers['host'];
            // res.setHeader('Location', `https://${host}/transactions/${transaction.id}`);
            res.json(transaction);
        } catch (error) {
            next(error);
        }
    }
);

returnOrderTransactionsRouter.post(
    '/:transactionId/confirm',
    permitScopes(['admin']),
    validator,
    async (req, res, next) => {
        try {
            const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
            const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
            const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
            const transactionResult = await sskts.service.transaction.returnOrder.confirm(
                req.user.sub,
                req.params.transactionId
            )({
                action: actionRepo,
                transaction: transactionRepo,
                organization: organizationRepo
            });
            debug('transaction confirmed', transactionResult);

            res.status(CREATED).json(transactionResult);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 取引検索
 */
returnOrderTransactionsRouter.get(
    '',
    permitScopes(['admin']),
    ...[
        query('startFrom').optional().isISO8601().toDate(),
        query('startThrough').optional().isISO8601().toDate(),
        query('endFrom').optional().isISO8601().toDate(),
        query('endThrough').optional().isISO8601().toDate()
    ],
    validator,
    async (req, res, next) => {
        try {
            const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
            const searchConditions: sskts.factory.transaction.ISearchConditions<sskts.factory.transactionType.ReturnOrder> = {
                ...req.query,
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : 100,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : 1,
                sort: (req.query.sort !== undefined) ? req.query.sort : { orderDate: sskts.factory.sortType.Descending },
                typeOf: sskts.factory.transactionType.ReturnOrder
            };
            const transactions = await transactionRepo.search(searchConditions);
            const totalCount = await transactionRepo.count(searchConditions);
            res.set('X-Total-Count', totalCount.toString());
            res.json(transactions);
        } catch (error) {
            next(error);
        }
    }
);

export default returnOrderTransactionsRouter;
