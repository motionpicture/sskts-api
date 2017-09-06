/**
 * event router
 * イベントルーター
 * @module eventsRouter
 */

import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';

import * as redis from '../../redis';
import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const eventsRouter = Router();
eventsRouter.use(authentication);

eventsRouter.get(
    '/individualScreeningEvent/:identifier',
    permitScopes(['events', 'events.read-only']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.event.findIndividualScreeningEventByIdentifier(req.params.identifier)(
                new sskts.repository.Event(sskts.mongoose.connection),
                new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient())
            ).then((event) => {
                res.json({
                    data: event
                });
            });
        } catch (error) {
            next(error);
        }
    });

eventsRouter.get(
    '/individualScreeningEvent',
    permitScopes(['events', 'events.read-only']),
    (__1, __2, next) => {
        // req.checkQuery('theater', 'invalid theater').notEmpty().withMessage('theater is required');
        // req.checkQuery('day', 'invalid day').notEmpty().withMessage('day is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const events = await sskts.service.event.searchIndividualScreeningEvents({
                day: req.query.day,
                theater: req.query.theater
            })(
                new sskts.repository.Event(sskts.mongoose.connection),
                new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient())
                );

            res.json({
                data: events
            });
        } catch (error) {
            next(error);
        }
    }
);

export default eventsRouter;
