"use strict";
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus.PROCESSING = "PROCESSING";
    TransactionStatus.CLOSED = "CLOSED";
    TransactionStatus.EXPIRED = "EXPIRED";
    TransactionStatus.CANCELED = "CANCELED";
})(TransactionStatus || (TransactionStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionStatus;
