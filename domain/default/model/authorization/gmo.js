"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class GMOAuthorization extends authorization_1.default {
    constructor(_id, price, owner_from, owner_to, gmo_shop_id, gmo_shop_pass, gmo_order_id, gmo_amount, gmo_access_id, gmo_access_pass, gmo_job_cd, gmo_pay_type) {
        super(_id, authorizationGroup_1.default.GMO, price, owner_from, owner_to);
        this._id = _id;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
        this.gmo_shop_id = gmo_shop_id;
        this.gmo_shop_pass = gmo_shop_pass;
        this.gmo_order_id = gmo_order_id;
        this.gmo_amount = gmo_amount;
        this.gmo_access_id = gmo_access_id;
        this.gmo_access_pass = gmo_access_pass;
        this.gmo_job_cd = gmo_job_cd;
        this.gmo_pay_type = gmo_pay_type;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GMOAuthorization;
