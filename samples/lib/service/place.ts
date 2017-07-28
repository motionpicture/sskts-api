/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 劇場検索
 */
export async function searchMovieTheaters(args: {
    auth: OAuth2client;
    searchConditions?: {};
}) {
    return await apiRequest({
        uri: '/places/movieTheater',
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK],
        qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() }
    });
}

/**
 * 劇場情報取得
 */
export async function findMovieTheater(args: {
    auth: OAuth2client;
    branchCode: string;
}) {
    return await apiRequest({
        uri: `/places/movieTheater/${args.branchCode}`,
        method: 'GET',
        expectedStatusCodes: [httpStatus.NOT_FOUND, httpStatus.OK],
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
