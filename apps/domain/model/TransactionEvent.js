"use strict";
class TransactionEvent {
    constructor(_id, group, authorization) {
        this._id = _id;
        this.group = group;
        this.authorization = authorization;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
