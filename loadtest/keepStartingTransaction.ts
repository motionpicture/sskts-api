/**
 * 取引開始をたたき続けるスクリプト
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:loadtest:keepStartingTransaction');

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 200;
const INTERVAL_MILLISECONDS = 100;
const API_ENDPOINT = process.env.TEST_API_ENDPOINT;

const timer = setInterval(
    async () => {
        if (count >= MAX_NUBMER_OF_PARALLEL_TASKS) {
            clearTimeout(timer);

            return;
        }

        count += 1;
        const countNow = count;

        try {
            // アクセストークン取得
            const accessToken = await request.post({
                url: `${API_ENDPOINT}/oauth/token`,
                body: {
                    assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                    scope: 'admin'
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                return response.body.access_token;
            });

            // 取引開始
            const transaction = await request.post({
                url: `${API_ENDPOINT}/transactions/startIfPossible`,
                auth: { bearer: accessToken },
                body: {
                    // tslint:disable-next-line:no-magic-numbers
                    expires_at: moment().add(30, 'minutes').unix()
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true
            }).then((response) => {
                return response.body.data;
            });
            debug('transaction:', (transaction !== null) ? transaction.id : null);

            debug('end', countNow);
        } catch (error) {
            console.error(error.message, countNow);
        }
    },
    INTERVAL_MILLISECONDS
);
