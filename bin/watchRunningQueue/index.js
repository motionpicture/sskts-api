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
 * 実行中ステータスのキュー監視
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
let countRetry = 0;
let countAbort = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 1000;
const RETRY_INTERVAL_MINUTES = 10;
const queueAdapter = sskts.adapter.queue(mongoose.connection);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countRetry += 1;
    try {
        yield sskts.service.queue.retry(RETRY_INTERVAL_MINUTES)(queueAdapter);
    }
    catch (error) {
        console.error(error.message);
    }
    countRetry -= 1;
}), INTERVAL_MILLISECONDS);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countAbort > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countAbort += 1;
    try {
        yield sskts.service.queue.abort(RETRY_INTERVAL_MINUTES)(queueAdapter);
    }
    catch (error) {
        console.error(error.message);
    }
    countAbort -= 1;
}), INTERVAL_MILLISECONDS);
