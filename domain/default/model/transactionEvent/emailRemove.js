"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class EmailRemoveTransactionEvent extends transactionEvent_1.default {
    constructor(_id, occurred_at, email_id) {
        super(_id, transactionEventGroup_1.default.EMAIL_REMOVE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.email_id = email_id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailRemoveTransactionEvent;
