"use strict";
const transactionEvent_1 = require("../model/transactionEvent");
const authorize_1 = require("../model/transactionEvent/authorize");
const unauthorize_1 = require("../model/transactionEvent/unauthorize");
function create(args) {
    return new transactionEvent_1.default((args._id === undefined) ? "" : (args._id), args.group);
}
exports.create = create;
function createAuthorize(args) {
    return new authorize_1.default(args._id, args.authorization);
}
exports.createAuthorize = createAuthorize;
function createUnauthorize(args) {
    return new unauthorize_1.default(args._id, args.authorization_id);
}
exports.createUnauthorize = createUnauthorize;
