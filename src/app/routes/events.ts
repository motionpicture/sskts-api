/**
 * イベントルーター
 *
 * @ignore
 */

import { Router } from 'express';
const eventsRouter = Router();

import * as sskts from '@motionpicture/sskts-domain';
import { NOT_FOUND } from 'http-status';

import * as redis from '../../redis';
import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

eventsRouter.use(authentication);

eventsRouter.get(
    '/individualScreeningEvent/:identifier',
    permitScopes(['events', 'events.read-only']),
    validator,
    async (req, res, next) => {
        try {
            await sskts.service.event.findIndividualScreeningEventByIdentifier(req.params.identifier)(
                sskts.adapter.event(sskts.mongoose.connection),
                sskts.adapter.itemAvailability.individualScreeningEvent(redis.getClient())
            ).then((option) => {
                option.match({
                    Some: (event) => {
                        res.json({
                            data: event
                        });
                    },
                    None: () => {
                        res.status(NOT_FOUND).json({
                            data: null
                        });
                    }
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
                sskts.adapter.event(sskts.mongoose.connection),
                sskts.adapter.itemAvailability.individualScreeningEvent(redis.getClient())
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
