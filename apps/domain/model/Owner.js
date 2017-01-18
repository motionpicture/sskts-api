"use strict";
const OwnerGroup_1 = require("./OwnerGroup");
class Owner {
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Owner;
class Anonymous extends Owner {
    constructor(_id, name_first, name_last, email, tel) {
        super(_id, OwnerGroup_1.default.ANONYMOUS);
        this._id = _id;
        this.name_first = name_first;
        this.name_last = name_last;
        this.email = email;
        this.tel = tel;
    }
}
exports.Anonymous = Anonymous;
class Member extends Owner {
    constructor(_id, name_first, name_last, email, tel) {
        super(_id, OwnerGroup_1.default.MEMBER);
        this._id = _id;
        this.name_first = name_first;
        this.name_last = name_last;
        this.email = email;
        this.tel = tel;
    }
}
exports.Member = Member;
