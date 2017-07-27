/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import OAuth2client from './auth/oAuth2client';

const debug = createDebug('sskts-api:samples');
const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export namespace auth {
    export class OAuth2 extends OAuth2client { }
}

export namespace event {
    /**
     * 上映イベント検索
     */
    export async function searchIndividualScreeningEvent(args: {
        auth: OAuth2client;
        searchConditions: {
            theater: string;
            day: string;
        }
    }) {
        return await request.get({
            url: `${API_ENDPOINT}/events/individualScreeningEvent`,
            qs: args.searchConditions,
            auth: { bearer: await args.auth.getAccessToken() },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            if (response.statusCode !== httpStatus.OK) {
                throw new Error(response.body.message);
            }

            return <any[]>response.body.data;
        });
    }

    /**
     * 上映イベント情報取得
     */
    export async function findIndividualScreeningEvent(args: {
        auth: OAuth2client;
        identifier: string;
    }) {
        return await request.get({
            url: `${API_ENDPOINT}/events/individualScreeningEvent/${args.identifier}`,
            auth: { bearer: await args.auth.getAccessToken() },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            debug('individualScreeningEvent requested', response.statusCode, response.body);
            if (response.statusCode !== httpStatus.OK) {
                throw new Error(response.body.message);
            }

            return <any>response.body.data;
        });
    }
}

export namespace person {
}

export namespace place {
    /**
     * 劇場検索
     */
    export async function searchMovieTheaters(args: {
        auth: OAuth2client;
        searchConditions?: {};
    }) {
        return await request.get({
            url: `${API_ENDPOINT}/places/movieTheater`,
            qs: args.searchConditions,
            auth: { bearer: await args.auth.getAccessToken() },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            debug('theater searched', response.statusCode, response.body);
            if (response.statusCode !== httpStatus.OK) {
                throw new Error(response.body.message);
            }

            return <any[]>response.body.data;
        });
    }

    /**
     * 劇場情報取得
     */
    export async function findMovieTheater(args: {
        auth: OAuth2client;
        branchCode: string;
    }) {
        return await request.get({
            url: `${API_ENDPOINT}/places/movieTheater/${args.branchCode}`,
            auth: { bearer: await args.auth.getAccessToken() },
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
    }
}

export namespace organization {
    /**
     * 劇場組織検索
     */
    export async function searchMovieTheaters(args: {
        auth: OAuth2client;
        searchConditions?: {};
    }) {
        return await request.get({
            url: `${API_ENDPOINT}/organizations/movieTheater`,
            qs: args.searchConditions,
            auth: { bearer: await args.auth.getAccessToken() },
            json: true,
            simple: false,
            resolveWithFullResponse: true
        }).then((response) => {
            debug('theater searched', response.statusCode, response.body);
            if (response.statusCode !== httpStatus.OK) {
                throw new Error(response.body.message);
            }

            return <any[]>response.body.data;
        });
    }
}

export namespace transaction {
    export namespace placeOrder {
        export async function start(args: {
            auth: OAuth2client;
            expires: Date; // 取引期限
            sellerId: string; // ショップID
        }) {
            return await request.post({
                url: `${API_ENDPOINT}/transactions/placeOrder/start`,
                auth: { bearer: await args.auth.getAccessToken() },
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

        export async function createSeatReservationAuthorization(args: {
            auth: OAuth2client;
            transactionId: string;
            eventIdentifier: string;
            offers: IOffer[];
        }) {
            return await request.post({
                url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/seatReservationAuthorization`,
                auth: { bearer: await args.auth.getAccessToken() },
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
        }

        export interface IGMOCardRaw {
            method: string;
            cardNo: string;
            expire: string;
            securityCode: string;
        }
        export type IGMOCardTokenized = string; // トークン決済の場合こちら
        export type IGMOCard = IGMOCardRaw | IGMOCardTokenized;
        export async function authorizeGMOCard(args: {
            auth: OAuth2client;
            transactionId: string;
            orderId: string;
            amount: number;
            creditCard: IGMOCard;
        }) {
            return await request.post({
                url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/paymentInfos/creditCard`,
                auth: { bearer: await args.auth.getAccessToken() },
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
        }) {
            await request.put({
                url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/agent/profile`,
                auth: { bearer: await args.auth.getAccessToken() },
                body: args.profile,
                json: true,
                resolveWithFullResponse: true
            }).then((response) => {
                debug('anonymousOwner updated.', response.statusCode, response.body);
                if (response.statusCode !== httpStatus.NO_CONTENT) {
                    throw new Error(response.body.message);
                }
            });
        }

        export async function confirm(args: {
            auth: OAuth2client;
            transactionId: string;
        }) {
            return await request.post({
                url: `${API_ENDPOINT}/transactions/placeOrder/${args.transactionId}/confirm`,
                auth: { bearer: await args.auth.getAccessToken() },
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
        }
    }
}
