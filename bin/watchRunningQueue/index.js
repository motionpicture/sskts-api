"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const queue_1 = require("../../domain/default/repository/interpreter/queue");
const queueStatus_1 = require("../../domain/default/model/queueStatus");
const moment = require("moment");
const mongoose = require("mongoose");
mongoose.set('debug', true);
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
function retry() {
    return __awaiter(this, void 0, void 0, function* () {
        let queueRepository = queue_1.default(mongoose.connection);
        yield queueRepository.findOneAndUpdate({
            status: queueStatus_1.default.RUNNING,
            last_tried_at: { $lt: moment().add("minutes", -10).toISOString() },
            $where: function () { return (this.max_count_try > this.count_tried); }
        }, {
            status: queueStatus_1.default.UNEXECUTED,
        });
    });
}
function abort() {
    return __awaiter(this, void 0, void 0, function* () {
        let queueRepository = queue_1.default(mongoose.connection);
        yield queueRepository.findOneAndUpdate({
            status: queueStatus_1.default.RUNNING,
            last_tried_at: { $lt: moment().add("minutes", -10).toISOString() },
            $where: function () { return (this.max_count_try === this.count_tried); }
        }, {
            status: queueStatus_1.default.ABORTED,
        });
    });
}
