"use strict";
const queue_1 = require("../queue");
const queueGroup_1 = require("../queueGroup");
class SettleAuthorizationQueue extends queue_1.default {
    constructor(_id, status, authorization) {
        super(_id, queueGroup_1.default.SETTLE_AUTHORIZATION, status);
        this._id = _id;
        this.status = status;
        this.authorization = authorization;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettleAuthorizationQueue;
