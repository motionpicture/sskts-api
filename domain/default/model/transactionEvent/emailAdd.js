"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class EmailAddTransactionEvent extends transactionEvent_1.default {
    constructor(_id, email) {
        super(_id, transactionEventGroup_1.default.EMAIL_ADD);
        this._id = _id;
        this.email = email;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailAddTransactionEvent;
