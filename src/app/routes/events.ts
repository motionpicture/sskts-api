/**
 * イベントルーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
import { query } from 'express-validator/check';

import * as redis from '../../redis';
import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const eventsRouter = Router();
eventsRouter.use(authentication);

eventsRouter.get(
    '/individualScreeningEvent/:identifier',
    permitScopes(['aws.cognito.signin.user.admin', 'events', 'events.read-only']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.offer.findIndividualScreeningEventByIdentifier(req.params.identifier)({
                event: new sskts.repository.Event(sskts.mongoose.connection),
                itemAvailability: new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient())
            }).then((event) => {
                res.json(event);
            });
        } catch (error) {
            next(error);
        }
    });

eventsRouter.get(
    '/individualScreeningEvent',
    permitScopes(['aws.cognito.signin.user.admin', 'events', 'events.read-only']),
    ...[
        query('startFrom').optional().isISO8601().toDate(),
        query('startThrough').optional().isISO8601().toDate(),
        query('endFrom').optional().isISO8601().toDate(),
        query('endThrough').optional().isISO8601().toDate()
    ],
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
            const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient());

            const searchConditions: sskts.factory.event.individualScreeningEvent.ISearchConditions = {
                ...req.query,
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(req.query.limit, 100) : undefined,
                page: (req.query.page !== undefined) ? Math.max(req.query.page, 1) : undefined,
                sort: (req.query.sort !== undefined) ? req.query.sort : { startDate: sskts.factory.sortType.Ascending }
            };
            const events = await sskts.service.offer.searchIndividualScreeningEvents(searchConditions)({
                event: eventRepo,
                itemAvailability: itemAvailabilityRepo
            });
            const totalCount = await eventRepo.countIndividualScreeningEvents(searchConditions);

            res.set('X-Total-Count', totalCount.toString());
            res.json(events);
        } catch (error) {
            next(error);
        }
    }
);

export default eventsRouter;
