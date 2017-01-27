"use strict";
class Asset {
    constructor(_id, group, owner, price, authorizations) {
        this._id = _id;
        this.group = group;
        this.owner = owner;
        this.price = price;
        this.authorizations = authorizations;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Asset;
