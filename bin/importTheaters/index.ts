/**
 * 劇場インポート
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

const theaterCode = '118';

async function main() {
    debug('mongoose connecting...');
    mongoose.connect(process.env.MONGOLAB_URI);

    const theaterRepository = sskts.createTheaterRepository(mongoose.connection);
    debug('repository created.');
    debug('importing theater...');
    await sskts.service.master.importTheater(theaterCode)(theaterRepository);
    debug('theater imported.');

    mongoose.disconnect();
}

main().then(() => {
    // process.exitCode = 0;
    // process.exit();
}).catch((err) => {
    console.error(err);
    // process.exit(0);
});
