/**
 * 実行中ステータスのキュー監視
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

let countRetry = 0;
let countAbort = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 1000;
const RETRY_INTERVAL_MINUTES = 10;
const queueAdapter = sskts.adapter.queue(mongoose.connection);

setInterval(
    async () => {
        if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countRetry += 1;

        try {
            await sskts.service.queue.retry(RETRY_INTERVAL_MINUTES)(queueAdapter);
        } catch (error) {
            console.error(error.message);
        }

        countRetry -= 1;
    },
    INTERVAL_MILLISECONDS
);

setInterval(
    async () => {
        if (countAbort > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countAbort += 1;

        try {
            await sskts.service.queue.abort(RETRY_INTERVAL_MINUTES)(queueAdapter);
        } catch (error) {
            console.error(error.message);
        }

        countAbort -= 1;
    },
    INTERVAL_MILLISECONDS
);
