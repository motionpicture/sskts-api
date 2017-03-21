/**
 * 開始準備のできた取引を用意するタスク
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-api:bin:prepareTransactions');
const NUMBER_OF_TRANSACTIONS_PER_TASK = 300; // 1タスクで生成する取引数
const EXPIRES_IN_SECONDS = 300; // 生成した取引がREADYステータスのままで期限切れするまでの時間

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const transactionAdapter = sskts.adapter.transaction(mongoose.connection);
    debug('preparing transactions...');
    await sskts.service.transaction.prepare(NUMBER_OF_TRANSACTIONS_PER_TASK, EXPIRES_IN_SECONDS)(transactionAdapter);

    mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
