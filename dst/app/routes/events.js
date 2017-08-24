"use strict";
/**
 * イベントルーター
 *
 * @ignore
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
const express_1 = require("express");
const eventsRouter = express_1.Router();
const sskts = require("@motionpicture/sskts-domain");
const http_status_1 = require("http-status");
const redis = require("../../redis");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
eventsRouter.use(authentication_1.default);
eventsRouter.get('/individualScreeningEvent/:identifier', permitScopes_1.default(['events', 'events.read-only']), validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield sskts.service.event.findIndividualScreeningEventByIdentifier(req.params.identifier)(sskts.adapter.event(sskts.mongoose.connection), sskts.adapter.itemAvailability.individualScreeningEvent(redis.getClient())).then((option) => {
            option.match({
                Some: (event) => {
                    res.json({
                        data: event
                    });
                },
                None: () => {
                    res.status(http_status_1.NOT_FOUND).json({
                        data: null
                    });
                }
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
        })(sskts.adapter.event(sskts.mongoose.connection), sskts.adapter.itemAvailability.individualScreeningEvent(redis.getClient()));
        res.json({
            data: events
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = eventsRouter;
