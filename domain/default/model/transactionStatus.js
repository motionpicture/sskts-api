"use strict";
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus.UNDERWAY = "UNDERWAY";
    TransactionStatus.CLOSED = "CLOSED";
    TransactionStatus.EXPIRED = "EXPIRED";
})(TransactionStatus || (TransactionStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionStatus;
