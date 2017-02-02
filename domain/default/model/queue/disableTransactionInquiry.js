"use strict";
const queue_1 = require("../queue");
const queueGroup_1 = require("../queueGroup");
class DisableTransactionInquiryQueue extends queue_1.default {
    constructor(_id, status, run_at, max_count_try, last_tried_at, count_tried, results, transaction_id) {
        super(_id, queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY, status, run_at, max_count_try, last_tried_at, count_tried, results);
        this._id = _id;
        this.status = status;
        this.run_at = run_at;
        this.max_count_try = max_count_try;
        this.last_tried_at = last_tried_at;
        this.count_tried = count_tried;
        this.results = results;
        this.transaction_id = transaction_id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DisableTransactionInquiryQueue;
