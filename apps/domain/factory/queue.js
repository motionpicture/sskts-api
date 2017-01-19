"use strict";
const queue_1 = require("../model/queue");
const settleAuthorization_1 = require("../model/queue/settleAuthorization");
const queueGroup_1 = require("../model/queueGroup");
function create(args) {
    return new queue_1.default(args._id, args.group, args.status);
}
exports.create = create;
function createSettleAuthorization(args) {
    return new settleAuthorization_1.default(`${queueGroup_1.default.SETTLE_AUTHORIZATION}_${args.authorization._id}`, args.status, args.authorization);
}
exports.createSettleAuthorization = createSettleAuthorization;
