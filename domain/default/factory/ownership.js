"use strict";
const ownership_1 = require("../model/ownership");
function create(args) {
    return new ownership_1.default(args._id, args.owner, args.authenticated);
}
exports.create = create;
