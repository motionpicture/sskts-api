"use strict";
const queue_1 = require("../model/queue");
const settleAuthorization_1 = require("../model/queue/settleAuthorization");
const cancelAuthorization_1 = require("../model/queue/cancelAuthorization");
const notificationPush_1 = require("../model/queue/notificationPush");
function create(args) {
    return new queue_1.default(args._id, args.group, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results);
}
exports.create = create;
function createSettleAuthorization(args) {
    return new settleAuthorization_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
}
exports.createSettleAuthorization = createSettleAuthorization;
function createCancelAuthorization(args) {
    return new cancelAuthorization_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.authorization);
}
exports.createCancelAuthorization = createCancelAuthorization;
function createNotificationPush(args) {
    return new notificationPush_1.default(args._id, args.status, args.run_at, args.max_count_try, args.last_tried_at, args.count_tried, args.results, args.notification);
}
exports.createNotificationPush = createNotificationPush;
