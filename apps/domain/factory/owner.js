"use strict";
const Owner = require("../model/Owner");
function createAnonymous(args) {
    return new Owner.Anonymous(args._id, (args.name_first) ? args.name_first : "", (args.name_last) ? args.name_last : "", (args.email) ? args.email : "", (args.tel) ? args.tel : "");
}
exports.createAnonymous = createAnonymous;
