"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class EmailRemoveTransactionEvent extends transactionEvent_1.default {
    constructor(_id, email_id) {
        super(_id, transactionEventGroup_1.default.EMAIL_REMOVE);
        this._id = _id;
        this.email_id = email_id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailRemoveTransactionEvent;
