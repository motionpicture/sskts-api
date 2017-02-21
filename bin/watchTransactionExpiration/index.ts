import * as SSKTS from '@motionpicture/sskts-domain';

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
    await SSKTS.TransactionService.expireOne()(SSKTS.createTransactionRepository(mongoose.connection));
}
