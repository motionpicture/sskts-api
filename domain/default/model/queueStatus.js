"use strict";
var QueueStatus;
(function (QueueStatus) {
    QueueStatus.UNEXECUTED = "UNEXECUTED";
    QueueStatus.RUNNING = "RUNNING";
    QueueStatus.EXECUTED = "EXECUTED";
})(QueueStatus || (QueueStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueueStatus;
