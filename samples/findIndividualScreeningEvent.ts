/**
 * 上映イベント情報取得サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';
import * as moment from 'moment';

import * as sskts from './lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.OAuth2(
        'motionpicture',
        'motionpicture',
        'teststate',
        ['admin']
    );

    // 上映イベント検索
    const individualScreeningEvents = await sskts.event.searchIndividualScreeningEvent({
        auth: auth,
        searchConditions: {
            theater: '118',
            day: moment().format('YYYYMMDD')
        }
    });

    // イベント情報取得
    const individualScreeningEvent = await sskts.event.findIndividualScreeningEvent({
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
