"use strict";
/**
 * 注文取引サービス
 *
 * @namespace service.transaction.placeOrder
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
const httpStatus = require("http-status");
const apiRequest_1 = require("../../apiRequest");
/**
 * 取引を開始する
 * 開始できない場合(混雑中など)、nullが返されます。
 */
function start(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: '/transactions/placeOrder/start',
            method: 'POST',
            expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
            auth: { bearer: yield args.auth.getAccessToken() },
            body: {
                expires: args.expires.valueOf(),
                sellerId: args.sellerId
            }
        });
    });
}
exports.start = start;
/**
 * 取引に座席予約を追加する
 */
function createSeatReservationAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
            method: 'POST',
            expectedStatusCodes: [httpStatus.OK],
            auth: { bearer: yield args.auth.getAccessToken() },
            body: {
                eventIdentifier: args.eventIdentifier,
                offers: args.offers
            }
        });
    });
}
exports.createSeatReservationAuthorization = createSeatReservationAuthorization;
/**
 * 決済方法として、クレジットカードを追加する
 */
function authorizeGMOCard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
            method: 'POST',
            expectedStatusCodes: [httpStatus.OK],
            auth: { bearer: yield args.auth.getAccessToken() },
            body: {
                orderId: args.orderId,
                amount: args.amount,
                method: (typeof args.creditCard !== 'string') ? args.creditCard.method : undefined,
                cardNo: (typeof args.creditCard !== 'string') ? args.creditCard.cardNo : undefined,
                expire: (typeof args.creditCard !== 'string') ? args.creditCard.expire : undefined,
                securityCode: (typeof args.creditCard !== 'string') ? args.creditCard.securityCode : undefined,
                token: (typeof args.creditCard === 'string') ? args.creditCard : undefined
            }
        });
    });
}
exports.authorizeGMOCard = authorizeGMOCard;
/**
 * 決済方法として、ムビチケを追加する
 */
function createMvtkAuthorization(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk`,
            method: 'POST',
            expectedStatusCodes: [httpStatus.OK],
            auth: { bearer: yield args.auth.getAccessToken() },
            body: args.mvtk
        });
    });
}
exports.createMvtkAuthorization = createMvtkAuthorization;
function setAgentProfile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield apiRequest_1.default({
            uri: `/transactions/placeOrder/${args.transactionId}/agent/profile`,
            method: 'PUT',
            expectedStatusCodes: [httpStatus.NO_CONTENT],
            auth: { bearer: yield args.auth.getAccessToken() },
            body: args.profile
        });
    });
}
exports.setAgentProfile = setAgentProfile;
function confirm(args) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield apiRequest_1.default({
            uri: `/transactions/placeOrder/${args.transactionId}/confirm`,
            method: 'POST',
            expectedStatusCodes: [httpStatus.CREATED],
            auth: { bearer: yield args.auth.getAccessToken() }
        });
    });
}
exports.confirm = confirm;
