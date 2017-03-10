/**
 * GMO仮売上キャンセル
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await execute();
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);

async function execute() {
    // 未実行のGMOオーソリ取消キューを取得
    const queueAdapter = sskts.createQueueAdapter(mongoose.connection);
    const option = await queueAdapter.findOneCancelGMOAuthorizationAndUpdate(
        {
            status: sskts.factory.queueStatus.UNEXECUTED,
            run_at: { $lt: new Date() }
        },
        {
            status: sskts.factory.queueStatus.RUNNING, // 実行中に変更
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }
    );

    if (!option.isEmpty) {
        const queue = option.get();
        debug('queue is', queue);

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await sskts.service.sales.cancelGMOAuth(queue.authorization)();
            // 実行済みに変更
            await queueAdapter.findOneAndUpdate({ _id: queue.id }, { status: sskts.factory.queueStatus.EXECUTED });
        } catch (error) {
            // 実行結果追加
            await queueAdapter.findOneAndUpdate({ _id: queue.id }, {
                $push: {
                    results: error.stack
                }
            });
        }
    }
}
