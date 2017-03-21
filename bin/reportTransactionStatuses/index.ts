/**
 * 取引ステータス集計を報告する
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-api:bin:reportTransactionStatuses');

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const transactionAdapter = sskts.adapter.transaction(mongoose.connection);
    debug('creating a report...');
    const report = await sskts.service.report.transactionStatuses()(transactionAdapter);
    await sskts.service.notification.report2developers(
        '現在の取引集計',
        `
date： ${moment().toISOString()}\n
\n
取引在庫数: ${report.nubmerOfTransactionsReady}\n
進行中取引数: ${report.nubmerOfTransactionsUnderway}\n
キュー未エクスポートの成立済み取引数: ${report.nubmerOfTransactionsClosedWithQueuesUnexported}\n
キュー未エクスポートの期限切れ取引数: ${report.nubmerOfTransactionsExpiredWithQueuesUnexported}\n
`
    )();

    mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
