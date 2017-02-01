import TransactionService from "../../domain/default/service/interpreter/transaction";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";
import TransactionStatus from "../../domain/default/model/transactionStatus";

import mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
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
    let transactionRepository = TransactionRepository(mongoose.connection);

    // 期限切れの取引を取得
    let option = await transactionRepository.findOneAndUpdate(
        {
            status: TransactionStatus.UNDERWAY,
            expired_at: { $lt: new Date() },
        },
        {
            status: TransactionStatus.UNDERWAY,
        }
    );

    if (!option.isEmpty) {
        let transaction = option.get();
        console.log("transaction is", transaction);

        // 期限切れにする
        await TransactionService.expire({
            transaction_id: transaction._id.toString()
        })(transactionRepository);
    }
}