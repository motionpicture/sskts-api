import Asset from "./Asset";
import AuthorizationGroup from "./AuthorizationGroup";

export default class Authorization {
    constructor(
        readonly _id: string,
        readonly group: AuthorizationGroup,
    ) {
        // TODO validation
    }
}

export class ASSET extends Authorization {
    constructor(
        readonly _id: string,
        readonly asset: Asset,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.ASSET);
    }
}

export class GMO extends Authorization {
    constructor(
        readonly _id: string,
        readonly order_id: string,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.GMO);
    }
}

export class COA extends Authorization {
    constructor(
        readonly _id: string,
        readonly coa_tmp_reserve_num: string,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.COA_SEAT_RESERVATION);
    }
}