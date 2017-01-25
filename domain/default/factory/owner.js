"use strict";
const owner_1 = require("../model/owner");
const anonymous_1 = require("../model/owner/anonymous");
const administrator_1 = require("../model/owner/administrator");
function create(args) {
    return new owner_1.default(args._id, args.group);
}
exports.create = create;
function createAnonymous(args) {
    return new anonymous_1.default(args._id, (args.name_first) ? args.name_first : "", (args.name_last) ? args.name_last : "", (args.email) ? args.email : "", (args.tel) ? args.tel : "");
}
exports.createAnonymous = createAnonymous;
function createAdministrator(args) {
    return new administrator_1.default(args._id, (args.name) ? args.name : { ja: "", en: "" });
}
exports.createAdministrator = createAdministrator;
