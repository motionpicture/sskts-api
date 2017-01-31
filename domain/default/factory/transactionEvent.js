"use strict";
const transactionEvent_1 = require("../model/transactionEvent");
const authorize_1 = require("../model/transactionEvent/authorize");
const unauthorize_1 = require("../model/transactionEvent/unauthorize");
const notificationAdd_1 = require("../model/transactionEvent/notificationAdd");
const notificationRemove_1 = require("../model/transactionEvent/notificationRemove");
function create(args) {
    return new transactionEvent_1.default(args._id, args.group, args.occurred_at);
}
exports.create = create;
function createAuthorize(args) {
    return new authorize_1.default(args._id, args.occurred_at, args.authorization);
}
exports.createAuthorize = createAuthorize;
function createUnauthorize(args) {
    return new unauthorize_1.default(args._id, args.occurred_at, args.authorization);
}
exports.createUnauthorize = createUnauthorize;
function createNotificationAdd(args) {
    return new notificationAdd_1.default(args._id, args.occurred_at, args.notification);
}
exports.createNotificationAdd = createNotificationAdd;
function createNotificationRemove(args) {
    return new notificationRemove_1.default(args._id, args.occurred_at, args.notification);
}
exports.createNotificationRemove = createNotificationRemove;
