/**
 * パフォーマンス検索の例
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples:searchPerformances');
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

    // パフォーマンス検索
    response = await request.get({
        url: `${API_ENDPOINT}/performances`,
        qs: {
            theater: '118',
            day: moment().format('YYYYMMDD')
        },
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('performance searched', response.statusCode, response.body);
    if (response.statusCode !== httpStatus.OK) {
        throw new Error(response.body.message);
    }
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
