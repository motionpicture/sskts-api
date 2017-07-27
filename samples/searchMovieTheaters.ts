/**
 * 劇場検索サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from './lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.OAuth2(
        'motionpicture',
        'motionpicture',
        'teststate',
        ['admin']
    );

    const movieTheaters = await sskts.organization.searchMovieTheaters({
        auth: auth
    });
    debug('movieTheaters are', movieTheaters);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err.message);
});
