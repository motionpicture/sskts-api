"use strict";
const queue_1 = require("../model/queue");
const settleAuthorization_1 = require("../model/queue/settleAuthorization");
const sendEmail_1 = require("../model/queue/sendEmail");
function create(args) {
    return new queue_1.default(args._id, args.group, args.status, args.executed_at, args.count_try);
}
exports.create = create;
function createSettleAuthorization(args) {
    return new settleAuthorization_1.default(args._id, args.status, args.executed_at, args.count_try, args.authorization);
}
exports.createSettleAuthorization = createSettleAuthorization;
function createSendEmail(args) {
    return new sendEmail_1.default(args._id, args.status, args.executed_at, args.count_try, args.email);
}
exports.createSendEmail = createSendEmail;
