"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * イベントルーター
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const express_1 = require("express");
// tslint:disable-next-line:no-submodule-imports
// import { query } from 'express-validator/check';
const moment = require("moment");
const redis = require("../../redis");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('sskts-api:routes');
const eventsRouter = express_1.Router();
eventsRouter.use(authentication_1.default);
eventsRouter.get('/individualScreeningEvent/:identifier', permitScopes_1.default(['aws.cognito.signin.user.admin', 'events', 'events.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.offer.findIndividualScreeningEventByIdentifier(req.params.identifier)({
            event: new sskts.repository.Event(sskts.mongoose.connection),
            itemAvailability: new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient())
        }).then((event) => {
            res.json(event);
        });
    }
    catch (error) {
        next(error);
    }
}));
eventsRouter.get('/individualScreeningEvent', permitScopes_1.default(['aws.cognito.signin.user.admin', 'events', 'events.read-only']), (req, __, next) => {
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
validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.getClient());
        const searchConditions = Object.assign({}, req.query, { startFrom: (req.query.startFrom !== undefined) ? moment(req.query.startFrom).toDate() : undefined, startThrough: (req.query.startThrough !== undefined) ? moment(req.query.startThrough).toDate() : undefined, endFrom: (req.query.endFrom !== undefined) ? moment(req.query.endFrom).toDate() : undefined, endThrough: (req.query.endThrough !== undefined) ? moment(req.query.endThrough).toDate() : undefined, 
            // tslint:disable-next-line:no-magic-numbers
            limit: (req.query.limit !== undefined) ? Math.min(Number(req.query.limit), 100) : undefined, page: (req.query.page !== undefined) ? Math.max(Number(req.query.page), 1) : undefined, sort: (req.query.sort !== undefined) ? req.query.sort : { startDate: sskts.factory.sortType.Ascending } });
        debug('searching events...', searchConditions);
        const events = yield sskts.service.offer.searchIndividualScreeningEvents(searchConditions)({
            event: eventRepo,
            itemAvailability: itemAvailabilityRepo
        });
        debug(events.length, 'events found');
        // const totalCount = await eventRepo.countIndividualScreeningEvents(searchConditions);
        const totalCount = events.length;
        res.set('X-Total-Count', totalCount.toString());
        res.json(events);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = eventsRouter;
