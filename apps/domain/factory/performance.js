"use strict";
const performance_1 = require("../model/performance");
function create(args) {
    return new performance_1.default(args._id, args.theater, args.screen, args.film, args.day, args.time_start, args.time_end, args.canceled);
}
exports.create = create;
