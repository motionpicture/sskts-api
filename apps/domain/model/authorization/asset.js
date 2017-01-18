"use strict";
const authorizationGroup_1 = require("../authorizationGroup");
const authorization_1 = require("../authorization");
class AssetAuthorization extends authorization_1.default {
    constructor(_id, asset, price) {
        super(_id, authorizationGroup_1.default.ASSET, price);
        this._id = _id;
        this.asset = asset;
        this.price = price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssetAuthorization;
