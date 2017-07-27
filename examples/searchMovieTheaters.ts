/**
 * 劇場検索サンプル
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

    const movieTheaters = await Scenarios.place.searchMovieTheaters({
        auth: auth
    });
    debug('movieTheaters are', movieTheaters);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
