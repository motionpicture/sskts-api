"use strict";
class Authorization {
    constructor(_id, group, price, owner_from, owner_to) {
        this._id = _id;
        this.group = group;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Authorization;
