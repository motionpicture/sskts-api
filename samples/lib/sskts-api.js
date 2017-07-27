"use strict";
/**
 * SSKTS API Node.js Client
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
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const oAuth2client_1 = require("./auth/oAuth2client");
const debug = createDebug('sskts-api:samples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;
var auth;
(function (auth) {
    class OAuth2 extends oAuth2client_1.default {
    }
    auth.OAuth2 = OAuth2;
})(auth = exports.auth || (exports.auth = {}));
var event;
(function (event) {
    /**
     * 上映イベント検索
     */
    function searchIndividualScreeningEvent(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request.get({
                url: `${API_ENDPOINT}/events/individualScreeningEvent`,
                qs: args.searchConditions,
                auth: { bearer: yield args.auth.getAccessToken() },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    throw new Error(response.body.message);
                }
                return response.body.data;
            });
        });
    }
    event.searchIndividualScreeningEvent = searchIndividualScreeningEvent;
    /**
     * 上映イベント情報取得
     */
    function findIndividualScreeningEvent(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request.get({
                url: `${API_ENDPOINT}/events/individualScreeningEvent/${args.identifier}`,
                auth: { bearer: yield args.auth.getAccessToken() },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                debug('individualScreeningEvent requested', response.statusCode, response.body);
                if (response.statusCode !== httpStatus.OK) {
                    throw new Error(response.body.message);
                }
                return response.body.data;
            });
        });
    }
    event.findIndividualScreeningEvent = findIndividualScreeningEvent;
})(event = exports.event || (exports.event = {}));
var place;
(function (place) {
    /**
     * 劇場検索
     */
    function searchMovieTheaters(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request.get({
                url: `${API_ENDPOINT}/places/movieTheater`,
                qs: args.searchConditions,
                auth: { bearer: yield args.auth.getAccessToken() },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                debug('theater searched', response.statusCode, response.body);
                if (response.statusCode !== httpStatus.OK) {
                    throw new Error(response.body.message);
                }
                return response.body.data;
            });
        });
    }
    place.searchMovieTheaters = searchMovieTheaters;
    /**
     * 劇場情報取得
     */
    function findMovieTheater(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request.get({
                url: `${API_ENDPOINT}/places/movieTheater/${args.branchCode}`,
                auth: { bearer: yield args.auth.getAccessToken() },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                debug('movieTheater requested', response.statusCode, response.body);
                if (response.statusCode !== httpStatus.OK) {
                    throw new Error(response.body.message);
                }
                return response.body.data;
            });
        });
    }
    place.findMovieTheater = findMovieTheater;
})(place = exports.place || (exports.place = {}));
var transaction;
(function (transaction) {
    let placeOrder;
    (function (placeOrder) {
        function start(args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield request.post({
                    url: `${API_ENDPOINT}/transactions/placeOrder/start`,
                    auth: { bearer: yield args.auth.getAccessToken() },
                    body: {
                        expires: args.expires.valueOf()
                    },
                    json: true,
                    simple: false,
                    resolveWithFullResponse: true
                }).then((response) => {
                    debug('transaction start result:', response.statusCode, response.body);
                    if (response.statusCode === httpStatus.NOT_FOUND) {
                        throw new Error('please try later');
                    }
                    if (response.statusCode !== httpStatus.OK) {
                        throw new Error(response.body.message);
                    }
                    return response.body.data;
                });
            });
        }
        placeOrder.start = start;
        function createSeatReservationAuthorization(args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield request.post({
                    url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
                    auth: { bearer: yield args.auth.getAccessToken() },
                    body: {
                        eventIdentifier: args.eventIdentifier,
                        offers: args.offers
                    },
                    json: true,
                    simple: false,
                    resolveWithFullResponse: true
                }).then((response) => {
                    debug('addCOASeatReservationAuthorization result:', response.statusCode, response.body);
                    if (response.statusCode !== httpStatus.OK) {
                        throw new Error(response.body.message);
                    }
                    return response.body.data;
                });
            });
        }
        placeOrder.createSeatReservationAuthorization = createSeatReservationAuthorization;
        function authorizeGMOCard(args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield request.post({
                    url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
                    auth: { bearer: yield args.auth.getAccessToken() },
                    body: {
                        orderId: args.orderId,
                        amount: args.amount,
                        method: (typeof args.creditCard !== 'string') ? args.creditCard.method : undefined,
                        cardNo: (typeof args.creditCard !== 'string') ? args.creditCard.cardNo : undefined,
                        expire: (typeof args.creditCard !== 'string') ? args.creditCard.expire : undefined,
                        securityCode: (typeof args.creditCard !== 'string') ? args.creditCard.securityCode : undefined,
                        token: (typeof args.creditCard === 'string') ? args.creditCard : undefined
                    },
                    json: true,
                    simple: false,
                    resolveWithFullResponse: true
                }).then((response) => {
                    debug('addGMOAuthorization result:', response.statusCode, response.body);
                    if (response.statusCode !== httpStatus.OK) {
                        throw new Error(response.body.message);
                    }
                    return response.body.data;
                });
            });
        }
        placeOrder.authorizeGMOCard = authorizeGMOCard;
        function setAgentProfile(args) {
            return __awaiter(this, void 0, void 0, function* () {
                yield request.put({
                    url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/agent/profile`,
                    auth: { bearer: yield args.auth.getAccessToken() },
                    body: args.profile,
                    json: true,
                    resolveWithFullResponse: true
                }).then((response) => {
                    debug('anonymousOwner updated.', response.statusCode, response.body);
                    if (response.statusCode !== httpStatus.NO_CONTENT) {
                        throw new Error(response.body.message);
                    }
                });
            });
        }
        placeOrder.setAgentProfile = setAgentProfile;
        function confirm(args) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield request.post({
                    url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/confirm`,
                    auth: { bearer: yield args.auth.getAccessToken() },
                    json: true,
                    simple: false,
                    resolveWithFullResponse: true
                }).then((response) => {
                    debug('confirmed', response.statusCode, response.body);
                    if (response.statusCode !== httpStatus.CREATED) {
                        throw new Error(response.body.message);
                    }
                    return response.body.data;
                });
            });
        }
        placeOrder.confirm = confirm;
    })(placeOrder = transaction.placeOrder || (transaction.placeOrder = {}));
})(transaction = exports.transaction || (exports.transaction = {}));
