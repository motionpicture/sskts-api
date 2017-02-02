"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
mongoose.set('debug', true);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
const moment = require("moment");
const transaction_1 = require("../../domain/default/service/interpreter/transaction");
const transaction_2 = require("../../domain/default/repository/interpreter/transaction");
const queue_1 = require("../../domain/default/repository/interpreter/queue");
const transactionStatus_1 = require("../../domain/default/model/transactionStatus");
const transactionQueuesStatus_1 = require("../../domain/default/model/transactionQueuesStatus");
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
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionRepository = transaction_2.default(mongoose.connection);
        let option = yield transactionRepository.findOneAndUpdate({
            status: { $in: [transactionStatus_1.default.CLOSED, transactionStatus_1.default.EXPIRED] },
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        }, {
            queues_status: transactionQueuesStatus_1.default.EXPORTING
        });
        if (!option.isEmpty) {
            let transaction = option.get();
            yield transaction_1.default.exportQueues({
                transaction_id: transaction._id.toString()
            })(transactionRepository, queue_1.default(mongoose.connection));
            yield transactionRepository.findOneAndUpdate({
                _id: transaction._id
            }, {
                queues_status: transactionQueuesStatus_1.default.EXPORTED
            });
        }
    });
}
function retry() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactionRepository = transaction_2.default(mongoose.connection);
        yield transactionRepository.findOneAndUpdate({
            queues_status: transactionQueuesStatus_1.default.EXPORTING,
            updated_at: { $lt: moment().add("minutes", -10).toISOString() },
        }, {
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        });
    });
}
