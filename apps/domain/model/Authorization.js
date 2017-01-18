"use strict";
class Authorization {
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Authorization;
class ASSET extends Authorization {
    constructor(_id, asset) {
        super(_id, 1);
        this._id = _id;
        this.asset = asset;
    }
}
exports.ASSET = ASSET;
class GMO extends Authorization {
    constructor(_id, order_id) {
        super(_id, 3);
        this._id = _id;
        this.order_id = order_id;
    }
}
exports.GMO = GMO;
class COA extends Authorization {
    constructor(_id, coa_tmp_reserve_num) {
        super(_id, 2);
        this._id = _id;
        this.coa_tmp_reserve_num = coa_tmp_reserve_num;
    }
}
exports.COA = COA;
