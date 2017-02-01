"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const transaction_1 = require("../../domain/default/service/interpreter/transaction");
const transaction_2 = require("../../domain/default/repository/interpreter/transaction");
const transactionStatus_1 = require("../../domain/default/model/transactionStatus");
const mongoose = require("mongoose");
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
        let transactionRepository = transaction_2.default(mongoose.connection);
        let option = yield transactionRepository.findOneAndUpdate({
            status: transactionStatus_1.default.UNDERWAY,
            expired_at: { $lt: new Date() },
        }, {
            status: transactionStatus_1.default.UNDERWAY,
        });
        if (!option.isEmpty) {
            let transaction = option.get();
            console.log("transaction is", transaction);
            yield transaction_1.default.expire({
                transaction_id: transaction._id.toString()
            })(transactionRepository);
        }
    });
}
