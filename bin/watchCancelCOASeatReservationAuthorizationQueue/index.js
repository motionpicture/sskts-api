"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const notification_1 = require("../../domain/default/service/interpreter/notification");
const queue_1 = require("../../domain/default/repository/interpreter/queue");
const queueStatus_1 = require("../../domain/default/model/queueStatus");
const mongoose = require("mongoose");
const COA = require("@motionpicture/coa-service");
const sendgrid = require("sendgrid");
const stock_1 = require("../../domain/default/service/interpreter/stock");
const NotificationFactory = require("../../domain/default/factory/notification");
const objectId_1 = require("../../domain/default/model/objectId");
mongoose.set('debug', true);
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
        let queueRepository = queue_1.default(mongoose.connection);
        let option = yield queueRepository.findOneCancelCOASeatReservationAuthorizationAndUpdate({
            status: queueStatus_1.default.UNEXECUTED,
            run_at: { $lt: new Date() },
        }, {
            status: queueStatus_1.default.RUNNING,
            last_tried_at: new Date(),
            $inc: { count_tried: 1 }
        });
        if (!option.isEmpty) {
            let queue = option.get();
            console.log("queue is", queue);
            try {
                yield stock_1.default.unauthorizeCOASeatReservation(queue.authorization)(COA);
                yield queueRepository.findOneAndUpdate({ _id: queue._id }, { status: queueStatus_1.default.EXECUTED });
                yield notification_1.default.sendEmail(NotificationFactory.createEmail({
                    _id: objectId_1.default(),
                    from: "noreply@localhost",
                    to: "hello@motionpicture.jp",
                    subject: "COA仮予約削除のお知らせ",
                    content: `
COA仮予約を削除しました。<br>
queue.authorization: ${queue.authorization}
`
                }))(sendgrid);
            }
            catch (error) {
                yield queueRepository.findOneAndUpdate({ _id: queue._id }, {
                    $push: {
                        results: error.stack
                    }
                });
            }
        }
    });
}
