import TransactionService from "../../domain/default/service/interpreter/transaction";
import TransactionRepository from "../../domain/default/repository/interpreter/transaction";

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
    await TransactionService.expireOne()(TransactionRepository(mongoose.connection));
}