import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

import TransactionService from "../../domain/default/service/interpreter/transaction";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";
import QueueRepository from "../../domain/default/repository/interpreter/queue";

import TransactionStatus from "../../domain/default/model/transactionStatus";
import TransactionQueuesStatus from "../../domain/default/model/transactionQueuesStatus";

let count = 0;

setInterval(async () => {
    if (count > 10) return;
    count++;

    try {
        await execute();
    } catch (error) {
        console.error(error.message);
    }

    count--;
}, 500);

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
        await transactionRepository.findOneAndUpdate({ _id: transaction._id }, { queues_status: TransactionQueuesStatus.EXPORTED });
    }
}