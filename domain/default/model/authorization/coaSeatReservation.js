"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class COASeatReservationAuthorization extends authorization_1.default {
    constructor(_id, coa_tmp_reserve_num, price, owner_from, owner_to, seats) {
        super(_id, authorizationGroup_1.default.COA_SEAT_RESERVATION, price, owner_from, owner_to);
        this._id = _id;
        this.coa_tmp_reserve_num = coa_tmp_reserve_num;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        this.seats = seats;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = COASeatReservationAuthorization;
