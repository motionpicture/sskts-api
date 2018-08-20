/**
 * 会員プログラムルーター
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const ownershipInfosRouter = Router();

ownershipInfosRouter.use(authentication);

ownershipInfosRouter.get(
    '/countByRegisterDateAndTheater',
    permitScopes(['aws.cognito.signin.user.admin']),
    (req, __, next) => {
        req.checkQuery('fromDate').notEmpty().isISO8601().withMessage('fromDate must be ISO8601 timestamp');
        req.checkQuery('toDate').notEmpty().isISO8601().withMessage('toDate must be ISO8601 timestamp');

        next();
    },
    validator, async (req, res, next) => {
        try {
            const fromDate: string = req.query.fromDate;
            const toDate: string = req.query.toDate;
            const theaterIds: string[] = req.query.theaterIds;

            const searchCondition = {
                createdAtFrom: new Date(fromDate),
                createdAtTo: new Date(toDate),
                theaterIds: theaterIds
            };

            const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
            const ownershipInfo = await repository.searchProgramMembership(searchCondition);

            return res.json({count: ownershipInfo});
        } catch (error) {
            return next(error);
        }
    }
);

export default ownershipInfosRouter;
