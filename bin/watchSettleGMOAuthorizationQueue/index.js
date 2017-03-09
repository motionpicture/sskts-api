"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GMO実売上
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const util = require("util");
const debug = createDebug('sskts-api:*');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    count += 1;
    try {
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    count -= 1;
}), INTERVAL_MILLISECONDS);
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        const queueRepository = sskts.createQueueRepository(mongoose.connection);
        // 未実行のGMO実売上キューを取得
        const option = yield queueRepository.findOneSettleGMOAuthorizationAndUpdate({
            status: sskts.model.QueueStatus.UNEXECUTED,
            run_at: { $lt: new Date() }
        }, {
            status: sskts.model.QueueStatus.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        });
        if (!option.isEmpty) {
            const queue = option.get();
            debug('queue is', queue);
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield sskts.service.sales.settleGMOAuth(queue.authorization)();
                // 実行済みに変更
                yield queueRepository.findOneAndUpdate({ _id: queue.id }, { status: sskts.model.QueueStatus.EXECUTED });
            }
            catch (error) {
                // 実行結果追加
                yield queueRepository.findOneAndUpdate({ _id: queue.id }, {
                    $push: {
                        results: error.stack
                    }
                });
            }
            // メール通知(開発中)
            if (process.env.NODE_ENV !== 'production') {
                yield sskts.service.notification.sendEmail(sskts.model.Notification.createEmail({
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
    });
}
