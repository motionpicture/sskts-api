"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class AuthorizeTransactionEvent extends transactionEvent_1.default {
    constructor(_id, occurred_at, authorization) {
        super(_id, transactionEventGroup_1.default.AUTHORIZE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.authorization = authorization;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthorizeTransactionEvent;
