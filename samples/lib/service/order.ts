/**
 * 注文サービス
 *
 * @namespace service.order
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 照会キーで注文情報を取得する
 * 存在しなければnullを返します。
 */
export async function findByOrderInquiryKey(args: {
    auth: OAuth2client;
    /**
     * 注文照会キー
     */
    orderInquiryKey: sskts.factory.orderInquiryKey.IOrderInquiryKey;
}): Promise<sskts.factory.order.IOrder | null> {
    return await apiRequest({
        uri: '/orders/findByOrderInquiryKey',
        method: 'POST',
        expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() },
        body: args.orderInquiryKey
    });
}
