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

    const theaterRepo = sskts.createTheaterAdapter(mongoose.connection);
    const screenRepo = sskts.createScreenAdapter(mongoose.connection);
    const promises = theaterCodes.map(async (theaterCode) => {
        try {
            debug('importing screens...');
            await sskts.service.master.importScreens(theaterCode)(theaterRepo, screenRepo);
            debug('screens imported.');
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
