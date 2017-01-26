"use strict";
const transaction_1 = require("../model/transaction");
const transactionQueuesStatus_1 = require("../model/transactionQueuesStatus");
function create(args) {
    return new transaction_1.default((args._id === undefined) ? "" : (args._id), args.status, (args.events === undefined) ? [] : (args.events), args.owners, (args.authorizations === undefined) ? [] : (args.authorizations), (args.emails === undefined) ? [] : (args.emails), (args.queues === undefined) ? [] : (args.queues), args.expired_at, (args.inquiry_id === undefined) ? "" : (args.inquiry_id), (args.inquiry_pass === undefined) ? "" : (args.inquiry_pass), (args.queues_status === undefined) ? transactionQueuesStatus_1.default.UNEXPORTED : (args.queues_status));
}
exports.create = create;
