"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class GMOAuthorization extends authorization_1.default {
    constructor(_id, order_id, price, owner_from, owner_to) {
        super(_id, authorizationGroup_1.default.GMO, price, owner_from, owner_to);
        this._id = _id;
        this.order_id = order_id;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GMOAuthorization;
