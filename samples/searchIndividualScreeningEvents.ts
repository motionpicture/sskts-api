/**
 * 上映イベント検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as moment from 'moment';

import * as sskts from './lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.ClientCredentials(
        'motionpicture',
        'motionpicture',
        'teststate',
        [
            'events.read-only'
        ]
    );
    const credentials = await auth.refreshAccessToken();
    debug('credentials:', credentials);

    const individualScreeningEvents = await sskts.service.event.searchIndividualScreeningEvent({
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
