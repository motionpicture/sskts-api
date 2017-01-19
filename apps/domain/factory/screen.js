"use strict";
const Screen = require("../model/screen");
function create(args) {
    return new Screen.default(args._id, args.theater, args.coa_screen_code, args.name, args.sections);
}
exports.create = create;
;
