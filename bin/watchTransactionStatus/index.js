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
mongoose.set('debug', true); // TODO 本番でははずす
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
const moment = require("moment");
let countExecute = 0;
let countRetry = 0;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countExecute > 10)
        return;
    countExecute++;
    try {
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    countExecute--;
}), 500);
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
/**
 * キューエクスポートを実行する
 */
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionRepository = SSKTS.createTransactionRepository(mongoose.connection);
        let option = yield transactionRepository.findOneAndUpdate({
            status: { $in: [SSKTS.TransactionStatus.CLOSED, SSKTS.TransactionStatus.EXPIRED] },
            queues_status: SSKTS.TransactionQueuesStatus.UNEXPORTED
        }, {
            queues_status: SSKTS.TransactionQueuesStatus.EXPORTING
        });
        if (!option.isEmpty) {
            let transaction = option.get();
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            yield SSKTS.TransactionService.exportQueues(transaction._id.toString())(transactionRepository, SSKTS.createQueueRepository(mongoose.connection));
            yield transactionRepository.findOneAndUpdate({
                _id: transaction._id
            }, {
                queues_status: SSKTS.TransactionQueuesStatus.EXPORTED
            });
        }
    });
}
/**
 * エクスポート中のままになっている取引についてリトライ
 */
function retry() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionRepository = SSKTS.createTransactionRepository(mongoose.connection);
        yield transactionRepository.findOneAndUpdate({
            queues_status: SSKTS.TransactionQueuesStatus.EXPORTING,
            updated_at: { $lt: moment().add('minutes', -10).toISOString() },
        }, {
            queues_status: SSKTS.TransactionQueuesStatus.UNEXPORTED
        });
    });
}
