"use strict";
const transactionEvent_1 = require("../model/transactionEvent");
function create(args) {
    return new transactionEvent_1.default((args._id === undefined) ? "" : (args._id), args.group);
}
exports.create = create;
