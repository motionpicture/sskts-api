"use strict";
const asset_1 = require("../asset");
const assetGroup_1 = require("../assetGroup");
class SeatReservationAsset extends asset_1.default {
    constructor(_id, price, authorizations, performance, section, seat_code) {
        super(_id, assetGroup_1.default.SEAT_RESERVATION, price, authorizations);
        this._id = _id;
        this.price = price;
        this.authorizations = authorizations;
        this.performance = performance;
        this.section = section;
        this.seat_code = seat_code;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatReservationAsset;
