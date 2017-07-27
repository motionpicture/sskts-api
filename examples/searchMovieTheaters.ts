/**
 * 劇場検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

import * as Scenarios from './scenarios';

const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;

async function main() {
    const accessToken = await Scenarios.getAccessToken();

    // 劇場検索
    await request.get({
        url: `${API_ENDPOINT}/places/movieTheater`,
        qs: {
        },
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('theater searched', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }

        debug('movieTheaters:', response.body.data);
    });
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
