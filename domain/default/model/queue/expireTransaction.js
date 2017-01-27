"use strict";
const queue_1 = require("../queue");
const queueGroup_1 = require("../queueGroup");
class ExpireTransactionQueue extends queue_1.default {
    constructor(_id, status, executed_at, count_try, transaction_id) {
        super(_id, queueGroup_1.default.EXPIRE_TRANSACTION, status, executed_at, count_try);
        this._id = _id;
        this.status = status;
        this.executed_at = executed_at;
        this.count_try = count_try;
        this.transaction_id = transaction_id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpireTransactionQueue;
