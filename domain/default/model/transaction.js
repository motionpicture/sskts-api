"use strict";
const transactionEventGroup_1 = require("./transactionEventGroup");
class Transaction {
    constructor(_id, status, events, owners, queues, expired_at, inquiry_id, inquiry_pass, queues_status) {
        this._id = _id;
        this.status = status;
        this.events = events;
        this.owners = owners;
        this.queues = queues;
        this.expired_at = expired_at;
        this.inquiry_id = inquiry_id;
        this.inquiry_pass = inquiry_pass;
        this.queues_status = queues_status;
    }
    authorizations() {
        let authorizations = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.AUTHORIZE;
        }).map((event) => {
            return event.authorization;
        });
        let removedAuthorizationIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.UNAUTHORIZE;
        }).map((event) => {
            return event.authorization_id.toString();
        });
        return authorizations.filter((authorization) => {
            return removedAuthorizationIds.indexOf(authorization._id.toString()) < 0;
        });
    }
    emails() {
        let emails = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.EMAIL_ADD;
        }).map((event) => {
            return event.email;
        });
        let removedEmailIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.EMAIL_REMOVE;
        }).map((event) => {
            return event.email_id.toString();
        });
        return emails.filter((email) => {
            return removedEmailIds.indexOf(email._id.toString()) < 0;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
