"use strict";
const transactionEvent_1 = require("../model/transactionEvent");
const authorize_1 = require("../model/transactionEvent/authorize");
const unauthorize_1 = require("../model/transactionEvent/unauthorize");
const emailAdd_1 = require("../model/transactionEvent/emailAdd");
const emailRemove_1 = require("../model/transactionEvent/emailRemove");
function create(args) {
    return new transactionEvent_1.default(args._id, args.group, args.occurred_at);
}
exports.create = create;
function createAuthorize(args) {
    return new authorize_1.default(args._id, args.occurred_at, args.authorization);
}
exports.createAuthorize = createAuthorize;
function createUnauthorize(args) {
    return new unauthorize_1.default(args._id, args.occurred_at, args.authorization_id);
}
exports.createUnauthorize = createUnauthorize;
function createEmailAdd(args) {
    return new emailAdd_1.default(args._id, args.occurred_at, args.email);
}
exports.createEmailAdd = createEmailAdd;
function createEmailRemove(args) {
    return new emailRemove_1.default(args._id, args.occurred_at, args.email_id);
}
exports.createEmailRemove = createEmailRemove;
