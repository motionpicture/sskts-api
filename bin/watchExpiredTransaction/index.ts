/**
 * 期限切れ取引監視
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

let countExecute = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const queueAdapter = sskts.adapter.queue(mongoose.connection);
const transactionAdapter = sskts.adapter.transaction(mongoose.connection);

setInterval(
    async () => {
        if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countExecute += 1;

        try {
            debug('exporting queues...');
            await sskts.service.transaction.exportQueues(sskts.factory.transactionStatus.EXPIRED)(queueAdapter, transactionAdapter);
        } catch (error) {
            console.error(error.message);
        }

        countExecute -= 1;
    },
    INTERVAL_MILLISECONDS
);
