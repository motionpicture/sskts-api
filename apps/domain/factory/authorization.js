"use strict";
const gmo_1 = require("../model/authorization/gmo");
const coaSeatReservation_1 = require("../model/authorization/coaSeatReservation");
function createGMO(args) {
    return new gmo_1.default(`GMOAuthorization_${args.order_id}`, args.order_id, args.price);
}
exports.createGMO = createGMO;
;
function createCOASeatReservation(args) {
    return new coaSeatReservation_1.default(`COASeatReservationAuthorization_${args.coa_tmp_reserve_num}`, args.coa_tmp_reserve_num, args.price);
}
exports.createCOASeatReservation = createCOASeatReservation;
;
