import TransactionService from "../../domain/default/service/interpreter/transaction";
import QueueRepository from "../../domain/default/repository/interpreter/queue";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";
import QueueStatus from "../../domain/default/model/queueStatus";

import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.connect(process.env.MONGOLAB_URI);
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
    let queueRepository = QueueRepository(mongoose.connection);
    let transactionRepository = TransactionRepository(mongoose.connection);

    // 未実行の取引期限切れキューを取得
    let option = await queueRepository.findOneExpireTransactionAndUpdate(
        {
            status: QueueStatus.UNEXECUTED,
            executed_at: { $lt: new Date() },
        },
        {
            status: QueueStatus.RUNNING,
            $inc: { count_try: 1 }
        }
    );

    if (!option.isEmpty) {
        let queue = option.get();
        console.log("queue is", queue);

        await TransactionService.expire({
            transaction_id: queue.transaction_id.toString()
        })(transactionRepository)
            .then(async () => {
                await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
            })
            .catch(async (err: Error) => {
                console.error(err);
                await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.UNEXECUTED });
            });
    }
}