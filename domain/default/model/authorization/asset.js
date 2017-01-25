"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class AssetAuthorization extends authorization_1.default {
    constructor(_id, asset, price, owner_from, owner_to) {
        super(_id, authorizationGroup_1.default.ASSET, price, owner_from, owner_to);
        this._id = _id;
        this.asset = asset;
        this.price = price;
        this.owner_from = owner_from;
        this.owner_to = owner_to;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssetAuthorization;
