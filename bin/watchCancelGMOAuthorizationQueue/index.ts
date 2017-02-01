import SalesService from "../../domain/default/service/interpreter/sales";
import QueueRepository from "../../domain/default/repository/interpreter/queue";
import QueueStatus from "../../domain/default/model/queueStatus";
import mongoose = require("mongoose");
import GMO = require("@motionpicture/gmo-service");

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
    // 未実行のGMOオーソリ取消キューを取得
    let queueRepository = QueueRepository(mongoose.connection);
    let option = await queueRepository.findOneCancelGMOAuthorizationAndUpdate(
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
        await SalesService.cancelGMOAuth(queue.authorization)(GMO);
        // 実行済みに変更
        await queueRepository.findOneAndUpdate({ _id: queue._id }, { status: QueueStatus.EXECUTED });
    }
}