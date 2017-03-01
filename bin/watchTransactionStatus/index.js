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
 * 取引ステータス監視
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const debug = createDebug('sskts-api:*');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
let countExecute = 0;
let countRetry = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countExecute += 1;
    try {
        debug('executing...');
        yield execute();
    }
    catch (error) {
        console.error(error.message);
    }
    countExecute -= 1;
}), INTERVAL_MILLISECONDS);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countRetry += 1;
    try {
        yield retry();
    }
    catch (error) {
        console.error(error.message);
    }
    countRetry -= 1;
}), INTERVAL_MILLISECONDS);
/**
 * キューエクスポートを実行する
 *
 * @ignore
 */
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = sskts.createTransactionRepository(mongoose.connection);
        const option = yield transactionRepository.findOneAndUpdate({
            status: { $in: [sskts.model.TransactionStatus.CLOSED, sskts.model.TransactionStatus.EXPIRED] },
            queues_status: sskts.model.TransactionQueuesStatus.UNEXPORTED
        }, {
            queues_status: sskts.model.TransactionQueuesStatus.EXPORTING
        });
        if (!option.isEmpty) {
            const transaction = option.get();
            debug('transaction is', transaction);
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            yield sskts.service.transaction.exportQueues(transaction.id.toString())(transactionRepository, sskts.createQueueRepository(mongoose.connection));
            yield transactionRepository.findOneAndUpdate({
                _id: transaction.id
            }, {
                queues_status: sskts.model.TransactionQueuesStatus.EXPORTED
            });
        }
    });
}
/**
 * エクスポート中のままになっている取引についてリトライ
 *
 * @ignore
 */
function retry() {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = sskts.createTransactionRepository(mongoose.connection);
        const RETRY_INTERVAL_MINUTES = 10;
        yield transactionRepository.findOneAndUpdate({
            queues_status: sskts.model.TransactionQueuesStatus.EXPORTING,
            updated_at: { $lt: moment().add(-RETRY_INTERVAL_MINUTES, 'minutes').toISOString() } // tslint:disable-line:no-magic-numbers
        }, {
            queues_status: sskts.model.TransactionQueuesStatus.UNEXPORTED
        });
    });
}
