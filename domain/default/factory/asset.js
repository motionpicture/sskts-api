"use strict";
const seatReservation_1 = require("../model/asset/seatReservation");
function createSeatReservation(args) {
    return new seatReservation_1.default(args.price, args.authorizations, args.performance, args.section, args.seat_code);
}
exports.createSeatReservation = createSeatReservation;
