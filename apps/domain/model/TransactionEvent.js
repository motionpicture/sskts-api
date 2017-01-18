"use strict";
const TransactionEventGroup_1 = require("./TransactionEventGroup");
class TransactionEvent {
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionEvent;
class Authorize extends TransactionEvent {
    constructor(_id, authorization) {
        super(_id, TransactionEventGroup_1.default.AUTHORIZE);
        this._id = _id;
        this.authorization = authorization;
    }
}
exports.Authorize = Authorize;
class Unauthoriza extends TransactionEvent {
    constructor(_id, authorization_id) {
        super(_id, TransactionEventGroup_1.default.UNAUTHORIZE);
        this._id = _id;
        this.authorization_id = authorization_id;
    }
}
exports.Unauthoriza = Unauthoriza;
