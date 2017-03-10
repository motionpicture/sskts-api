/**
 * 劇場インポート
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

// 複数劇場導入に対応のつもり todo 環境設定
const theaterCodes = [
    '000',
    '001',
    '118'
];

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI);

    const theaterAdapter = sskts.createTheaterAdapter(mongoose.connection);
    const promises = theaterCodes.map(async (theaterCode) => {
        try {
            debug('importing theater...');
            await sskts.service.master.importTheater(theaterCode)(theaterAdapter);
            debug('theater imported.');
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);

    mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
