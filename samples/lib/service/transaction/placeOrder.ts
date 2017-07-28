/**
 * 注文取引サービス
 *
 * @namespace service.transaction.placeOrder
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../../apiRequest';

import OAuth2client from '../../auth/oAuth2client';

/**
 * 取引を開始する
 * 開始できない場合(混雑中など)、nullが返されます。
 */
export async function start(args: {
    auth: OAuth2client;
    expires: Date; // 取引期限
    sellerId: string; // ショップID
}): Promise<sskts.factory.transaction.ITransaction> {
    return await apiRequest({
        uri: '/transactions/placeOrder/start',
        method: 'POST',
        expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            expires: args.expires.valueOf(),
            sellerId: args.sellerId
        }
    });
}

export interface IOffer {
    seatSection: string;
    seatNumber: string;
    ticket: {
        ticketCode: string;
        stdPrice: number;
        addPrice: number;
        disPrice: number;
        salePrice: number;
        mvtkAppPrice: 0,
        ticketCount: 1,
        seatNum: string;
        addGlasses: 0,
        kbnEisyahousiki: string;
        mvtkNum: string;
        mvtkKbnDenshiken: string;
        mvtkKbnMaeuriken: string;
        mvtkKbnKensyu: string;
        mvtkSalesPrice: number;
    };
}

/**
 * 取引に座席予約を追加する
 */
export async function createSeatReservationAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    eventIdentifier: string;
    offers: IOffer[];
}): Promise<sskts.factory.authorization.seatReservation.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: {
            eventIdentifier: args.eventIdentifier,
            offers: args.offers
        }
    });
}

export interface ICreditCardRaw {
    method: string;
    cardNo: string;
    expire: string;
    securityCode: string;
}
export type ICreditCardTokenized = string; // トークン決済の場合こちら
export type ICreditCard = ICreditCardRaw | ICreditCardTokenized;

/**
 * 決済方法として、クレジットカードを追加する
 */
export async function authorizeGMOCard(args: {
    auth: OAuth2client;
    transactionId: string;
    orderId: string;
    amount: number;
    creditCard: ICreditCard;
}): Promise<sskts.factory.authorization.gmo.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
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
}

export type IMvtk = sskts.factory.authorization.mvtk.IResult & {
    price: number;
};

/**
 * 決済方法として、ムビチケを追加する
 */
export async function createMvtkAuthorization(args: {
    auth: OAuth2client;
    transactionId: string;
    mvtk: IMvtk;
}): Promise<sskts.factory.authorization.mvtk.IAuthorization> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/paymentInfos/mvtk`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.mvtk
    });
}

export interface IAgentProfile {
    givenName: string;
    familyName: string;
    telephone: string;
    email: string;
}
export async function setAgentProfile(args: {
    auth: OAuth2client;
    transactionId: string;
    profile: IAgentProfile;
}): Promise<void> {
    await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/agent/profile`,
        method: 'PUT',
        expectedStatusCodes: [httpStatus.NO_CONTENT],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.profile
    });
}

export async function confirm(args: {
    auth: OAuth2client;
    transactionId: string;
}): Promise<sskts.factory.order.IOrder> {
    return await apiRequest({
        uri: `/transactions/placeOrder/${args.transactionId}/confirm`,
        method: 'POST',
        expectedStatusCodes: [httpStatus.CREATED],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
