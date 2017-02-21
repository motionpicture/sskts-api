import * as SSKTS from '@motionpicture/sskts-domain';
import mongoose = require('mongoose');
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
import moment = require('moment');

let countExecute = 0;
let countRetry = 0;

setInterval(async () => {
    if (countExecute > 10) return;
    countExecute++;

    try {
        await execute();
    } catch (error) {
        console.error(error.message);
    }

    countExecute--;
}, 500);

setInterval(async () => {
    if (countRetry > 10) return;
    countRetry++;

    try {
        await retry();
    } catch (error) {
        console.error(error.message);
    }

    countRetry--;
}, 500);

/**
 * キューエクスポートを実行する
 */
async function execute() {
    let transactionRepository = SSKTS.createTransactionRepository(mongoose.connection);

    let option = await transactionRepository.findOneAndUpdate(
        {
            status: { $in: [SSKTS.TransactionStatus.CLOSED, SSKTS.TransactionStatus.EXPIRED] },
            queues_status: SSKTS.TransactionQueuesStatus.UNEXPORTED
        },
        {
            queues_status: SSKTS.TransactionQueuesStatus.EXPORTING
        }
    );

    if (!option.isEmpty) {
        let transaction = option.get();

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await SSKTS.TransactionService.exportQueues(transaction._id.toString())(transactionRepository, SSKTS.createQueueRepository(mongoose.connection));
        await transactionRepository.findOneAndUpdate(
            {
                _id: transaction._id
            },
            {
                queues_status: SSKTS.TransactionQueuesStatus.EXPORTED
            }
        );
    }
}

/**
 * エクスポート中のままになっている取引についてリトライ
 */
async function retry() {
    let transactionRepository = SSKTS.createTransactionRepository(mongoose.connection);

    await transactionRepository.findOneAndUpdate(
        {
            queues_status: SSKTS.TransactionQueuesStatus.EXPORTING,
            updated_at: { $lt: moment().add('minutes', -10).toISOString() },
        },
        {
            queues_status: SSKTS.TransactionQueuesStatus.UNEXPORTED
        }
    );
}
