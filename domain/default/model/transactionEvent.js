"use strict";
class TransactionEvent {
    constructor(_id, group, occurred_at) {
        this._id = _id;
        this.group = group;
        this.occurred_at = occurred_at;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
