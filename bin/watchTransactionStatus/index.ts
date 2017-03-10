/**
 * 取引ステータス監視
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

let countExecute = 0;
let countRetry = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;

setInterval(
    async () => {
        if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countExecute += 1;

        try {
            debug('executing...');
            await execute();
        } catch (error) {
            console.error(error.message);
        }

        countExecute -= 1;
    },
    INTERVAL_MILLISECONDS
);

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

/**
 * キューエクスポートを実行する
 *
 * @ignore
 */
async function execute() {
    const transactionAdapter = sskts.createTransactionAdapter(mongoose.connection);

    const option = await transactionAdapter.findOneAndUpdate(
        {
            status: { $in: [sskts.factory.transactionStatus.CLOSED, sskts.factory.transactionStatus.EXPIRED] },
            queues_status: sskts.factory.transactionQueuesStatus.UNEXPORTED
        },
        {
            queues_status: sskts.factory.transactionQueuesStatus.EXPORTING
        }
    );

    if (!option.isEmpty) {
        const transaction = option.get();
        debug('transaction is', transaction);

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await sskts.service.transaction.exportQueues(transaction.id.toString())(
            transactionAdapter,
            sskts.createQueueAdapter(mongoose.connection)
        );
        await transactionAdapter.findOneAndUpdate(
            {
                _id: transaction.id
            },
            {
                queues_status: sskts.factory.transactionQueuesStatus.EXPORTED
            }
        );
    }
}

/**
 * エクスポート中のままになっている取引についてリトライ
 *
 * @ignore
 */
async function retry() {
    const transactionAdapter = sskts.createTransactionAdapter(mongoose.connection);
    const RETRY_INTERVAL_MINUTES = 10;

    await transactionAdapter.findOneAndUpdate(
        {
            queues_status: sskts.factory.transactionQueuesStatus.EXPORTING,
            updated_at: { $lt: moment().add(-RETRY_INTERVAL_MINUTES, 'minutes').toISOString() } // tslint:disable-line:no-magic-numbers
        },
        {
            queues_status: sskts.factory.transactionQueuesStatus.UNEXPORTED
        }
    );
}
