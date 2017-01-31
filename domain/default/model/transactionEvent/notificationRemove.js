"use strict";
const transactionEvent_1 = require("../transactionEvent");
const transactionEventGroup_1 = require("../transactionEventGroup");
class NotificationRemoveTransactionEvent extends transactionEvent_1.default {
    constructor(_id, occurred_at, notification) {
        super(_id, transactionEventGroup_1.default.NOTIFICATION_REMOVE, occurred_at);
        this._id = _id;
        this.occurred_at = occurred_at;
        this.notification = notification;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationRemoveTransactionEvent;
