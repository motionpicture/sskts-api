/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

export interface IOrderInquiryKey {
    theaterCode: string;
    orderNumber: number;
    telephone: string;
}

export type IOrder = any;

export async function findByOrderInquiryKey(args: {
    auth: OAuth2client;
    orderInquiryKey: IOrderInquiryKey;
}): Promise<IOrder | null> {
    return await apiRequest({
        uri: '/orders/findByOrderInquiryKey',
        method: 'POST',
        expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.orderInquiryKey
    });
}
