/**
 * COA仮予約資産移動
 *
 * @ignore
 */
import * as SSKTS from '@motionpicture/sskts-domain';
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
    const queueRepository = SSKTS.createQueueRepository(mongoose.connection);
    const assetRepository = SSKTS.createAssetRepository(mongoose.connection);

    // 未実行のCOA資産移動キューを取得
    const option = await queueRepository.findOneSettleCOASeatReservationAuthorizationAndUpdate(
        {
            status: SSKTS.QueueStatus.UNEXECUTED,
            run_at: { $lt: new Date() }
        },
        {
            status: SSKTS.QueueStatus.RUNNING, // 実行中に変更
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }
    );

    if (!option.isEmpty) {
        const queue = option.get();
        debug('queue is', queue);

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await SSKTS.StockService.transferCOASeatReservation(queue.authorization)(assetRepository);
            await queueRepository.findOneAndUpdate({ _id: queue.id }, { status: SSKTS.QueueStatus.EXECUTED });
        } catch (error) {
            // 実行結果追加
            await queueRepository.findOneAndUpdate({ _id: queue.id }, {
                $push: {
                    results: error.stack
                }
            });
        }
    }
}
