"use strict";
var TransactionEventGroup;
(function (TransactionEventGroup) {
    TransactionEventGroup.START = "START";
    TransactionEventGroup.CLOSE = "CLOSE";
    TransactionEventGroup.EXPIRE = "EXPIRE";
    TransactionEventGroup.CANCEL = "CANCEL";
    TransactionEventGroup.AUTHORIZE = "AUTHORIZE";
    TransactionEventGroup.UNAUTHORIZE = "UNAUTHORIZE";
    TransactionEventGroup.EMAIL_ADD = "EMAIL_ADD";
    TransactionEventGroup.EMAIL_REMOVE = "EMAIL_REMOVE";
})(TransactionEventGroup || (TransactionEventGroup = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEventGroup;
