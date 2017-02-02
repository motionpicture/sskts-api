import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
import moment = require("moment");

import TransactionService from "../../domain/default/service/interpreter/transaction";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";
import QueueRepository from "../../domain/default/repository/interpreter/queue";

import TransactionStatus from "../../domain/default/model/transactionStatus";
import TransactionQueuesStatus from "../../domain/default/model/transactionQueuesStatus";

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
    let transactionRepository = TransactionRepository(mongoose.connection);

    let option = await transactionRepository.findOneAndUpdate(
        {
            status: { $in: [TransactionStatus.CLOSED, TransactionStatus.EXPIRED] },
            queues_status: TransactionQueuesStatus.UNEXPORTED
        },
        {
            queues_status: TransactionQueuesStatus.EXPORTING
        }
    );

    if (!option.isEmpty) {
        let transaction = option.get();

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await TransactionService.exportQueues({
            transaction_id: transaction._id.toString()
        })(transactionRepository, QueueRepository(mongoose.connection));
        await transactionRepository.findOneAndUpdate(
            {
                _id: transaction._id
            },
            {
                queues_status: TransactionQueuesStatus.EXPORTED
            }
        );
    }
}

/**
 * エクスポート中のままになっている取引についてリトライ
 */
async function retry() {
    let transactionRepository = TransactionRepository(mongoose.connection);

    await transactionRepository.findOneAndUpdate(
        {
            queues_status: TransactionQueuesStatus.EXPORTING,
            updated_at: { $lt: moment().add("minutes", -10).toISOString() },
        },
        {
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }
    );
}
