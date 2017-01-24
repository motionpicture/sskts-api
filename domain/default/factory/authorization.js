"use strict";
const gmo_1 = require("../model/authorization/gmo");
const coaSeatReservation_1 = require("../model/authorization/coaSeatReservation");
function createGMO(args) {
    return new gmo_1.default(args._id, args.order_id, args.price);
}
exports.createGMO = createGMO;
;
function createCOASeatReservation(args) {
    return new coaSeatReservation_1.default(args._id, args.coa_tmp_reserve_num, args.price);
}
exports.createCOASeatReservation = createCOASeatReservation;
;
