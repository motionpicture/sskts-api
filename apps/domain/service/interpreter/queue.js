"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const transactionStatus_1 = require("../../model/transactionStatus");
const QueueFactory = require("../../factory/queue");
const queueGroup_1 = require("../../model/queueGroup");
const queueStatus_1 = require("../../model/queueStatus");
var interpreter;
(function (interpreter) {
    function importFromTransaction() {
        return (transactionRepository, queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield transactionRepository.findOneAndUpdate({
                status: { $in: [transactionStatus_1.default.CLOSED, transactionStatus_1.default.EXPIRED] },
                queues_imported: false
            }, {
                queues_imported: false
            });
            if (option.isEmpty)
                return;
            let transaction = option.get();
            console.log("transaction is", transaction);
            let promises = [];
            switch (transaction.status) {
                case transactionStatus_1.default.CLOSED:
                    promises = promises.concat(transaction.authorizations.map((authorization) => __awaiter(this, void 0, void 0, function* () {
                        let queue = QueueFactory.createSettleAuthorization({
                            status: queueStatus_1.default.UNEXECUTED,
                            authorization: authorization
                        });
                        yield queueRepository.store(queue);
                    })));
                    break;
                case transactionStatus_1.default.EXPIRED:
                    break;
                default:
                    break;
            }
            yield Promise.all(promises);
            console.log("queues created.");
            yield transactionRepository.findOneAndUpdate({
                _id: transaction._id
            }, {
                queues_imported: true
            });
        });
    }
    interpreter.importFromTransaction = importFromTransaction;
    function settleAuthorization() {
        return (queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield queueRepository.findOneAndUpdate({
                status: queueStatus_1.default.UNEXECUTED,
                group: queueGroup_1.default.SETTLE_AUTHORIZATION
            }, { status: queueStatus_1.default.RUNNING });
            if (option.isEmpty)
                return;
            let queue = option.get();
            console.log("queue is", queue);
            yield queueRepository.findOneAndUpdate({ _id: queue._id }, { status: queueStatus_1.default.EXECUTED });
        });
    }
    interpreter.settleAuthorization = settleAuthorization;
    function cancelAuthorization() {
        return (queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield queueRepository.findOneAndUpdate({
                status: queueStatus_1.default.UNEXECUTED,
                group: queueGroup_1.default.CANCEL_AUTHORIZATION
            }, { status: queueStatus_1.default.RUNNING });
            if (option.isEmpty)
                return;
            let queue = option.get();
            console.log("queue is", queue);
            yield queueRepository.findOneAndUpdate({ _id: queue._id }, { status: queueStatus_1.default.EXECUTED });
        });
    }
    interpreter.cancelAuthorization = cancelAuthorization;
    function sendEmail() {
        return (queueRepository) => __awaiter(this, void 0, void 0, function* () {
            let option = yield queueRepository.findOneAndUpdate({
                status: queueStatus_1.default.UNEXECUTED,
                group: queueGroup_1.default.SEND_EMAIL
            }, { status: queueStatus_1.default.RUNNING });
            if (option.isEmpty)
                return;
            let queue = option.get();
            console.log("queue is", queue);
            yield queueRepository.findOneAndUpdate({ _id: queue._id }, { status: queueStatus_1.default.EXECUTED });
        });
    }
    interpreter.sendEmail = sendEmail;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
