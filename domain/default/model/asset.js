"use strict";
class Asset {
    constructor(_id, group, price, authorizations) {
        this._id = _id;
        this.group = group;
        this.price = price;
        this.authorizations = authorizations;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Asset;
