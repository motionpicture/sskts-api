"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class Unauthorize extends transactionEvent_1.default {
    constructor(_id, occurred_at, authorization_id) {
        super(_id, transactionEventGroup_1.default.UNAUTHORIZE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.authorization_id = authorization_id;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Unauthorize;
