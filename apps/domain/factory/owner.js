"use strict";
const anonymous_1 = require("../model/owner/anonymous");
function createAnonymous(args) {
    return new anonymous_1.default(args._id, (args.name_first) ? args.name_first : "", (args.name_last) ? args.name_last : "", (args.email) ? args.email : "", (args.tel) ? args.tel : "");
}
exports.createAnonymous = createAnonymous;
