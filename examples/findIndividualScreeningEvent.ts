/**
 * 上映イベント情報取得サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as moment from 'moment';

import * as Scenarios from './scenarios';

const debug = createDebug('sskts-api:examples');

async function main() {
    const auth = new Scenarios.OAuth2(
        <string>process.env.SSKTS_API_REFRESH_TOKEN,
        ['admin']
    );

    // 上映イベント検索
    const individualScreeningEvents = await Scenarios.event.searchIndividualScreeningEvent({
        auth: auth,
        searchConditions: {
            theater: '118',
            day: moment().format('YYYYMMDD')
        }
    });

    // イベント情報取得
    const individualScreeningEvent = await Scenarios.event.findIndividualScreeningEvent({
        auth: auth,
        identifier: individualScreeningEvents[0].identifier
    });
    debug('individualScreeningEvent is', individualScreeningEvent);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
