/**
 * 実行中ステータスのキュー監視
 *
 * @ignore
 */
import * as SSKTS from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

let countRetry = 0;
let countAbort = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;

setInterval(
    async () => {
        if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countRetry += 1;

        try {
            await retry();
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
            await abort();
        } catch (error) {
            console.error(error.message);
        }

        countAbort -= 1;
    },
    INTERVAL_MILLISECONDS
);

const RETRY_INTERVAL_MINUTES = 10;

/**
 * 最終試行から10分経過したキューのリトライ
 *
 * @ignore
 */
async function retry() {
    const queueRepository = SSKTS.createQueueRepository(mongoose.connection);

    await queueRepository.findOneAndUpdate(
        {
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -RETRY_INTERVAL_MINUTES).toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function (this: any) { return (this.max_count_try > this.count_tried); }
        },
        {
            status: SSKTS.QueueStatus.UNEXECUTED // 実行中に変更
        }
    );
}

/**
 * 最大試行回数に達したキューを実行中止にする
 *
 * @ignore
 */
async function abort() {
    const queueRepository = SSKTS.createQueueRepository(mongoose.connection);

    const abortedQueue = await queueRepository.findOneAndUpdate(
        {
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -RETRY_INTERVAL_MINUTES).toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function (this: any) { return (this.max_count_try === this.count_tried); }
        },
        {
            status: SSKTS.QueueStatus.ABORTED
        }
    );
    debug('abortedQueue:', abortedQueue);
}
