"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SSKTS = require("@motionpicture/sskts-domain");
const mongoose = require("mongoose");
const COA = require("@motionpicture/coa-service");
const sendgrid = require("sendgrid");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
let count = 0;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > 10)
        return;
    count++;
    try {
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    count--;
}), 500);
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        // 未実行のCOA仮予約取消キューを取得
        let queueRepository = SSKTS.createQueueRepository(mongoose.connection);
        let option = yield queueRepository.findOneCancelCOASeatReservationAuthorizationAndUpdate({
            status: SSKTS.QueueStatus.UNEXECUTED,
            run_at: { $lt: new Date() },
        }, {
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 } // トライ回数増やす
        });
        if (!option.isEmpty) {
            let queue = option.get();
            console.log('queue is', queue);
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield SSKTS.StockService.unauthorizeCOASeatReservation(queue.authorization)(COA);
                // 実行済みに変更
                yield queueRepository.findOneAndUpdate({ _id: queue._id }, { status: SSKTS.QueueStatus.EXECUTED });
                // メール通知 TODO 開発中だけ？
                yield SSKTS.NotificationService.sendEmail(SSKTS.Notification.createEmail({
                    from: 'noreply@localhost',
                    to: 'hello@motionpicture.jp',
                    subject: 'COA仮予約削除のお知らせ',
                    content: `
COA仮予約を削除しました。<br>
queue.authorization: ${queue.authorization}
`
                }))(sendgrid);
            }
            catch (error) {
                // 実行結果追加
                yield queueRepository.findOneAndUpdate({ _id: queue._id }, {
                    $push: {
                        results: error.stack
                    }
                });
            }
        }
    });
}
