/**
 * 取引フローテストスクリプト
 *
 * @ignore
 */
import * as createDebug from 'debug';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:*');
const API_ENDPOINT = 'http://localhost:8081'; // tslint:disable-line:no-http-string

async function main() {
    const response = await request.post({
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

    const theaterResponse = await request.get({
        url: `${API_ENDPOINT}/theaters/118`,
        // url: 'https://devssktsapionlinux.azurewebsites.net/theaters/118',
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    debug('theater result:', theaterResponse.statusCode, theaterResponse.body);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
