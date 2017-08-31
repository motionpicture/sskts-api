"use strict";
/**
 * event router
 * イベントルーター
 * @module eventsRouter
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const express_1 = require("express");
const redis = require("../../redis");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
const eventsRouter = express_1.Router();
eventsRouter.use(authentication_1.default);
eventsRouter.get('/individualScreeningEvent/:identifier', permitScopes_1.default(['events', 'events.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.event.findIndividualScreeningEventByIdentifier(req.params.identifier)(sskts.repository.event(sskts.mongoose.connection), sskts.repository.itemAvailability.individualScreeningEvent(redis.getClient())).then((event) => {
            res.json({
                data: event
            });
        });
    }
    catch (error) {
        next(error);
    }
}));
eventsRouter.get('/individualScreeningEvent', permitScopes_1.default(['events', 'events.read-only']), (__1, __2, next) => {
    // req.checkQuery('theater', 'invalid theater').notEmpty().withMessage('theater is required');
    // req.checkQuery('day', 'invalid day').notEmpty().withMessage('day is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const events = yield sskts.service.event.searchIndividualScreeningEvents({
            day: req.query.day,
            theater: req.query.theater
        })(sskts.repository.event(sskts.mongoose.connection), sskts.repository.itemAvailability.individualScreeningEvent(redis.getClient()));
        res.json({
            data: events
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = eventsRouter;
