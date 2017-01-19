"use strict";
class Transaction {
    constructor(_id, status, events, owners, authorizations, expired_at, inquiry_id, inquiry_pass) {
        this._id = _id;
        this.status = status;
        this.events = events;
        this.owners = owners;
        this.authorizations = authorizations;
        this.expired_at = expired_at;
        this.inquiry_id = inquiry_id;
        this.inquiry_pass = inquiry_pass;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
