"use strict";
const transaction_1 = require("../model/transaction");
function create(args) {
    return new transaction_1.default((args._id === undefined) ? "" : (args._id), args.status, (args.events === undefined) ? [] : (args.events), args.owners, (args.authorizations === undefined) ? [] : (args.authorizations), [], args.expired_at, (args.inquiry_id === undefined) ? "" : (args.inquiry_id), (args.inquiry_pass === undefined) ? "" : (args.inquiry_pass), (args.queues_imported === undefined) ? false : (args.queues_imported));
}
exports.create = create;
