/**
 * イベントルーター
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
// tslint:disable-next-line:no-submodule-imports
// import { query } from 'express-validator/check';
import * as moment from 'moment';

import * as redis from '../../redis';
import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:routes');

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
    (req, __, next) => {
        req.checkQuery('startFrom').optional().isISO8601().withMessage('startFrom must be ISO8601 timestamp');
        req.checkQuery('startThrough').optional().isISO8601().withMessage('startThrough must be ISO8601 timestamp');
        req.checkQuery('endFrom').optional().isISO8601().withMessage('endFrom must be ISO8601 timestamp');
        req.checkQuery('endThrough').optional().isISO8601().withMessage('endThrough must be ISO8601 timestamp');

        next();
    },
    // ...[
    //     query('startFrom').optional().isISO8601().toDate(),
    //     query('startThrough').optional().isISO8601().toDate(),
    //     query('endFrom').optional().isISO8601().toDate(),
    //     query('endThrough').optional().isISO8601().toDate()
    // ],
    validator,
    async (req, res, next) => {
        try {
            const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
            const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient());

            const searchConditions: sskts.factory.event.individualScreeningEvent.ISearchConditions = {
                ...req.query,
                startFrom: (req.query.startFrom !== undefined) ? moment(req.query.startFrom).toDate() : undefined,
                startThrough: (req.query.startThrough !== undefined) ? moment(req.query.startThrough).toDate() : undefined,
                endFrom: (req.query.endFrom !== undefined) ? moment(req.query.endFrom).toDate() : undefined,
                endThrough: (req.query.endThrough !== undefined) ? moment(req.query.endThrough).toDate() : undefined,
                // tslint:disable-next-line:no-magic-numbers
                limit: (req.query.limit !== undefined) ? Math.min(Number(req.query.limit), 100) : undefined,
                page: (req.query.page !== undefined) ? Math.max(Number(req.query.page), 1) : undefined,
                sort: (req.query.sort !== undefined) ? req.query.sort : { startDate: sskts.factory.sortType.Ascending }
            };
            debug('searching events...', searchConditions);
            const events = await sskts.service.offer.searchIndividualScreeningEvents(searchConditions)({
                event: eventRepo,
                itemAvailability: itemAvailabilityRepo
            });
            debug(events.length, 'events found');
            // const totalCount = await eventRepo.countIndividualScreeningEvents(searchConditions);
            // const totalCount = events.length;

            // res.set('X-Total-Count', totalCount.toString());
            res.json(events);
        } catch (error) {
            next(error);
        }
    }
);

export default eventsRouter;
