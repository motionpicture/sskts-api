"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class GMOAuthorization extends authorization_1.default {
    constructor(_id, order_id, price) {
        super(_id, authorizationGroup_1.default.GMO, price);
        this._id = _id;
        this.order_id = order_id;
        this.price = price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GMOAuthorization;
