"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class EmailAddTransactionEvent extends transactionEvent_1.default {
    constructor(_id, occurred_at, email) {
        super(_id, transactionEventGroup_1.default.EMAIL_ADD, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.email = email;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailAddTransactionEvent;
