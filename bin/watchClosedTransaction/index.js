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
 * 成立取引監視
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-api:*');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
let countExecute = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const queueAdapter = sskts.adapter.queue(mongoose.connection);
const transactionAdapter = sskts.adapter.transaction(mongoose.connection);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countExecute += 1;
    try {
        debug('exporting queues...');
        yield sskts.service.transaction.exportQueues(sskts.factory.transactionStatus.CLOSED)(queueAdapter, transactionAdapter);
    }
    catch (error) {
        console.error(error.message);
    }
    countExecute -= 1;
}), INTERVAL_MILLISECONDS);
