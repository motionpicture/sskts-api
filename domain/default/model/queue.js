"use strict";
class Queue {
    constructor(_id, group, status, run_at, max_count_retry, last_tried_at, count_tried, results) {
        this._id = _id;
        this.group = group;
        this.status = status;
        this.run_at = run_at;
        this.max_count_retry = max_count_retry;
        this.last_tried_at = last_tried_at;
        this.count_tried = count_tried;
        this.results = results;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queue;
