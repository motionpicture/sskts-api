/**
 * 劇場インポート
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

const theaterCode = '118';

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI);

    const theaterRepository = sskts.createTheaterRepository(mongoose.connection);
    debug('repository created.');
    debug('importing theater...');
    await sskts.service.master.importTheater(theaterCode)(theaterRepository);
    debug('theater imported.');

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
