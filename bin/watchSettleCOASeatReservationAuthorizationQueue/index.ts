/**
 * COA仮予約資産移動
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';
import * as util from 'util';

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
    const queueRepository = sskts.createQueueRepository(mongoose.connection);
    const assetRepository = sskts.createAssetRepository(mongoose.connection);

    // 未実行のCOA資産移動キューを取得
    const option = await queueRepository.findOneSettleCOASeatReservationAuthorizationAndUpdate(
        {
            status: sskts.model.QueueStatus.UNEXECUTED,
            run_at: { $lt: new Date() }
        },
        {
            status: sskts.model.QueueStatus.RUNNING, // 実行中に変更
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        }
    );

    if (!option.isEmpty) {
        const queue = option.get();
        debug('queue is', queue);

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await sskts.service.stock.transferCOASeatReservation(queue.authorization)(assetRepository);
            await queueRepository.findOneAndUpdate({ _id: queue.id }, { status: sskts.model.QueueStatus.EXECUTED });
        } catch (error) {
            // 実行結果追加
            await queueRepository.findOneAndUpdate({ _id: queue.id }, {
                $push: {
                    results: error.stack
                }
            });
        }

        // メール通知(開発中)
        if (process.env.NODE_ENV !== 'production') {
            await sskts.service.notification.sendEmail(sskts.model.Notification.createEmail({
                from: 'noreply@localhost',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: `sskts-api[${process.env.NODE_ENV}] queue executed.`,
                content: `
executed queue:\n
${util.inspect(queue, { showHidden: true, depth: 10 })}\n
`
            }))();
        }
    }
}
