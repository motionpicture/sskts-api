import NotificationService from "../../domain/default/service/interpreter/notification";
import QueueRepository from "../../domain/default/repository/interpreter/queue";
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

    // 未実行のメール送信キューを取得
    let option = await queueRepository.findOneSendEmailAndUpdate(
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

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await NotificationService.sendEmail(queue.notification);
        await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
    }
}