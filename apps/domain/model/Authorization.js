"use strict";
const authorizationGroup_1 = require("./authorizationGroup");
class Authorization {
    constructor(_id, group, price) {
        this._id = _id;
        this.group = group;
        this.price = price;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Authorization;
class ASSET extends Authorization {
    constructor(_id, asset, price) {
        super(_id, authorizationGroup_1.default.ASSET, price);
        this._id = _id;
        this.asset = asset;
        this.price = price;
    }
}
exports.ASSET = ASSET;
class GMO extends Authorization {
    constructor(_id, order_id, price) {
        super(_id, authorizationGroup_1.default.GMO, price);
        this._id = _id;
        this.order_id = order_id;
        this.price = price;
    }
}
exports.GMO = GMO;
class COA extends Authorization {
    constructor(_id, coa_tmp_reserve_num, price) {
        super(_id, authorizationGroup_1.default.COA_SEAT_RESERVATION, price);
        this._id = _id;
        this.coa_tmp_reserve_num = coa_tmp_reserve_num;
        this.price = price;
    }
}
exports.COA = COA;
