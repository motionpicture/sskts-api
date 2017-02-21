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
const moment = require("moment");
const mongoose = require("mongoose");
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
let countRetry = 0;
let countAbort = 0;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countRetry > 10)
        return;
    countRetry++;
    try {
        yield retry();
    }
    catch (error) {
        console.error(error.message);
    }
    countRetry--;
}), 500);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countAbort > 10)
        return;
    countAbort++;
    try {
        yield abort();
    }
    catch (error) {
        console.error(error.message);
    }
    countAbort--;
}), 500);
/**
 * 最終試行から10分経過したキューのリトライ
 */
function retry() {
    return __awaiter(this, void 0, void 0, function* () {
        let queueRepository = SSKTS.createQueueRepository(mongoose.connection);
        yield queueRepository.findOneAndUpdate({
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -10).toISOString() },
            $where: function () { return (this.max_count_try > this.count_tried); }
        }, {
            status: SSKTS.QueueStatus.UNEXECUTED,
        });
    });
}
/**
 * 最大試行回数に達したキューを実行中止にする
 */
function abort() {
    return __awaiter(this, void 0, void 0, function* () {
        let queueRepository = SSKTS.createQueueRepository(mongoose.connection);
        yield queueRepository.findOneAndUpdate({
            status: SSKTS.QueueStatus.RUNNING,
            last_tried_at: { $lt: moment().add('minutes', -10).toISOString() },
            $where: function () { return (this.max_count_try === this.count_tried); }
        }, {
            status: SSKTS.QueueStatus.ABORTED,
        });
    });
}
