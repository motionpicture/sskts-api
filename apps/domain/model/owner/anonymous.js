"use strict";
const owner_1 = require("../owner");
const ownerGroup_1 = require("../ownerGroup");
class AnonymousOwner extends owner_1.default {
    constructor(_id, name_first, name_last, email, tel) {
        super(_id, ownerGroup_1.default.ANONYMOUS);
        this._id = _id;
        this.name_first = name_first;
        this.name_last = name_last;
        this.email = email;
        this.tel = tel;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnonymousOwner;
