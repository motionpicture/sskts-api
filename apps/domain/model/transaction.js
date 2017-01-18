"use strict";
class Transaction {
    constructor(_id, password, status, events, owners, authorizations, expired_at, access_id, access_pass) {
        this._id = _id;
        this.password = password;
        this.status = status;
        this.events = events;
        this.owners = owners;
        this.authorizations = authorizations;
        this.expired_at = expired_at;
        this.access_id = access_id;
        this.access_pass = access_pass;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
