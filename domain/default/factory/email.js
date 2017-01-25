"use strict";
const email_1 = require("../model/email");
function create(args) {
    return new email_1.default(args._id, (args.from === undefined) ? "" : (args.from), (args.to === undefined) ? "" : (args.to), (args.subject === undefined) ? "" : (args.subject), (args.body === undefined) ? "" : (args.body));
}
exports.create = create;
