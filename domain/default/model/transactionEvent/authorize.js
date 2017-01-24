"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class AuthorizeTransactionEvent extends transactionEvent_1.default {
    constructor(_id, authorization) {
        super(_id, transactionEventGroup_1.default.AUTHORIZE);
        this._id = _id;
        this.authorization = authorization;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthorizeTransactionEvent;
