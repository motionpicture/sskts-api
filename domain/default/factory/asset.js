"use strict";
const seatReservation_1 = require("../model/asset/seatReservation");
function createSeatReservation(args) {
    return new seatReservation_1.default(args._id, args.owner, args.authorizations, args.performance, args.section, args.seat_code, args.ticket_code, args.ticket_name_ja, args.ticket_name_en, args.ticket_name_kana, args.std_price, args.add_price, args.dis_price, args.sale_price);
}
exports.createSeatReservation = createSeatReservation;
