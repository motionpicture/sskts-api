import * as SSKTS from '@motionpicture/sskts-domain';
import sendgrid = require('sendgrid');

import mongoose = require('mongoose');
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
    let queueRepository = SSKTS.createQueueRepository(mongoose.connection);

    // 未実行のメール送信キューを取得
    let option = await queueRepository.findOneSendEmailAndUpdate(
        {
            status: SSKTS.QueueStatus.UNEXECUTED,
            run_at: { $lt: new Date() },
        },
        {
            status: SSKTS.QueueStatus.RUNNING, // 実行中に変更
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }
    );

    if (!option.isEmpty) {
        let queue = option.get();
        console.log('queue is', queue);

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await SSKTS.NotificationService.sendEmail(queue.notification)(sendgrid);
            await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: SSKTS.QueueStatus.EXECUTED });
        } catch (error) {
            // 実行結果追加
            await queueRepository.findOneAndUpdate({ _id: queue._id }, {
                $push: {
                    results: error.stack
                }
            });
        }
    }
}
