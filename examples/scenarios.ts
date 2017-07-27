/**
 * APIシナリオ
 */

import * as createDebug from 'debug';
// import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export async function getAccessToken() {
    debug('requesting access token...');

    return await request.post({
        url: `${API_ENDPOINT}/oauth/token`,
        body: {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => response.body.access_token);
}
