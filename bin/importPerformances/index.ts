/**
 * 劇場インポート
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-api:*');

// 複数劇場導入に対応のつもり todo 環境設定
const theaterCodes = [
    '118'
];

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const filmRepo = sskts.adapter.film(mongoose.connection);
    const screenRepo = sskts.adapter.screen(mongoose.connection);
    const performanceRepo = sskts.adapter.performance(mongoose.connection);
    const promises = theaterCodes.map(async (theaterCode) => {
        try {
            debug('importing performances...');
            // todo 日付調整
            await sskts.service.master.importPerformances(theaterCode, '20170201', '20170401')(filmRepo, screenRepo, performanceRepo);
            debug('performances imported.');
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);

    mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
