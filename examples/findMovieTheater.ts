/**
 * 劇場取得サンプル
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

    // 劇場情報取得
    await request.get({
        url: `${API_ENDPOINT}/places/movieTheater/118`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('movieTheater requested', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }
        const theater = response.body.data.attributes;
        debug(theater);
    });
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
