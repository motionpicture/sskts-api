"use strict";
const owner_1 = require("../owner");
const ownerGroup_1 = require("../ownerGroup");
class AdministratorOwner extends owner_1.default {
    constructor(_id, name) {
        super(_id, ownerGroup_1.default.ADMINISTRATOR);
        this._id = _id;
        this.name = name;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdministratorOwner;
