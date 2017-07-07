/**
 * 環境変数取得サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples:getEnvironmentVariables');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;

async function main() {
    let response: any;

    // アクセストークン取得
    response = await request.post({
        url: `${API_ENDPOINT}/oauth/token`,
        body: {
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('oauth token result:', response.statusCode, response.body);
    const accessToken = response.body.access_token;

    response = await request.get({
        url: `${API_ENDPOINT}/dev/environmentVariables`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('/theaters/:id result:', response.statusCode, response.body);
    if (response.statusCode !== httpStatus.OK) {
        throw new Error(response.body.message);
    }
    const variables = response.body.data.attributes;
    debug(variables);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
