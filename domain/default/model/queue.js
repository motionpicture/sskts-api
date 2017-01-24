"use strict";
class Queue {
    constructor(_id, group, status, executed_at, count_try) {
        this._id = _id;
        this.group = group;
        this.status = status;
        this.executed_at = executed_at;
        this.count_try = count_try;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queue;
