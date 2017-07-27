/**
 * 上映イベント検索サンプル
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

    const individualScreeningEvents = await Scenarios.event.searchIndividualScreeningEvent({
        auth: auth,
        searchConditions: {
            theater: '118',
            day: moment().format('YYYYMMDD')
        }
    });
    debug('number of individualScreeningEvents is', individualScreeningEvents.length);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
