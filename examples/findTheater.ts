/**
 * 劇場テストの例
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:examples:transaction');
const API_ENDPOINT = 'http://localhost:8081'; // tslint:disable-line:no-http-string

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

    // パフォーマンス取得
    debug('finding theater...');
    response = await request.get({
        url: `${API_ENDPOINT}/theaters/118`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('/theaters/:id result:', response.statusCode, response.body);
    if (response.statusCode !== httpStatus.OK) {
        throw new Error(response.body.message);
    }
    const theater = response.body.data.attributes;
    debug(theater);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
