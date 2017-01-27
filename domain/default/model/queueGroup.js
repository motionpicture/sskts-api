"use strict";
var QueueGroup;
(function (QueueGroup) {
    QueueGroup.SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    QueueGroup.CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    QueueGroup.SEND_EMAIL = "SEND_EMAIL";
    QueueGroup.EXPIRE_TRANSACTION = "EXPIRE_TRANSACTION";
})(QueueGroup || (QueueGroup = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueueGroup;
