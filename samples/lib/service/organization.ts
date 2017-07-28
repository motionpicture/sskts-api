/**
 * SSKTS API Node.js Client
 *
 * @ignore
 */

import * as httpStatus from 'http-status';
import apiRequest from '../apiRequest';

import OAuth2client from '../auth/oAuth2client';

/**
 * 劇場組織検索
 */
export async function searchMovieTheaters(args: {
    auth: OAuth2client;
    searchConditions?: {};
}): Promise<any[]> {
    return await apiRequest({
        uri: '/organizations/movieTheater',
        method: 'GET',
        expectedStatusCodes: [httpStatus.OK],
        qs: args.searchConditions,
        auth: { bearer: await args.auth.getAccessToken() }
    });
}
