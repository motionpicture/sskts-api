/**
 * 上映イベント検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';
import * as util from 'util';

import * as Scenarios from './scenarios';

const debug = createDebug('sskts-api:examples');
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;

async function main() {
    const accessToken = await Scenarios.getAccessToken();

    // 上映イベント検索
    await request.get({
        url: `${API_ENDPOINT}/events/individualScreeningEvent`,
        qs: {
            theater: '118',
            day: moment().format('YYYYMMDD')
        },
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }).then((response) => {
        debug('events searched', response.statusCode, response.body);
        if (response.statusCode !== httpStatus.OK) {
            throw new Error(response.body.message);
        }

        debug('first event detail is', util.inspect(response.body.data[0]));
    });
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
