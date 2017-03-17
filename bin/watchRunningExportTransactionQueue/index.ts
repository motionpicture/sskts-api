/**
 * 取引キューエクスポートが実行中のままになっている取引を監視する
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

let countRetry = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const transactionAdapter = sskts.adapter.transaction(mongoose.connection);
const RETRY_INTERVAL_MINUTES = 10;

setInterval(
    async () => {
        if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countRetry += 1;

        try {
            debug('reexporting queues...');
            await sskts.service.transaction.reexportQueues(RETRY_INTERVAL_MINUTES)(transactionAdapter);
        } catch (error) {
            console.error(error.message);
        }

        countRetry -= 1;
    },
    INTERVAL_MILLISECONDS
);
