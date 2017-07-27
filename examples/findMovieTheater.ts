/**
 * 劇場取得サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as Scenarios from './scenarios';

const debug = createDebug('sskts-api:examples');

async function main() {
    const auth = new Scenarios.OAuth2(
        <string>process.env.SSKTS_API_REFRESH_TOKEN,
        ['admin']
    );

    // 劇場情報取得
    const movieTheater = await Scenarios.place.findMovieTheater({
        auth: auth,
        branchCode: '118'
    });
    debug('movieTheater is', movieTheater);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
