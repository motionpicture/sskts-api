"use strict";
var TransactionEventGroup;
(function (TransactionEventGroup) {
    TransactionEventGroup.START = "START";
    TransactionEventGroup.CLOSE = "CLOSE";
    TransactionEventGroup.EXPIRE = "EXPIRE";
    TransactionEventGroup.AUTHORIZE = "AUTHORIZE";
    TransactionEventGroup.UNAUTHORIZE = "UNAUTHORIZE";
    TransactionEventGroup.NOTIFICATION_ADD = "NOTIFICATION_ADD";
    TransactionEventGroup.NOTIFICATION_REMOVE = "NOTIFICATION_REMOVE";
})(TransactionEventGroup || (TransactionEventGroup = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEventGroup;
