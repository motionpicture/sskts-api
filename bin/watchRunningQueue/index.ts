import * as SSKTS from '@motionpicture/sskts-domain';
import moment = require('moment');

import mongoose = require('mongoose');
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
let countRetry = 0;
let countAbort = 0;

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

setInterval(async () => {
    if (countAbort > 10) return;
    countAbort++;

    try {
        await abort();
    } catch (error) {
        console.error(error.message);
    }

    countAbort--;
}, 500);

/**
 * 最終試行から10分経過したキューのリトライ
 */
async function retry() {
    let queueRepository = SSKTS.createQueueRepository(mongoose.connection);

    await queueRepository.findOneAndUpdate(
        {
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -10).toISOString() },
            $where: function (this: any) { return (this.max_count_try > this.count_tried) }
        },
        {
            status: SSKTS.QueueStatus.UNEXECUTED, // 実行中に変更
        }
    );
}

/**
 * 最大試行回数に達したキューを実行中止にする
 */
async function abort() {
    let queueRepository = SSKTS.createQueueRepository(mongoose.connection);

    await queueRepository.findOneAndUpdate(
        {
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -10).toISOString() },
            $where: function (this: any) { return (this.max_count_try === this.count_tried) }
        },
        {
            status: SSKTS.QueueStatus.ABORTED,
        }
    );
}
