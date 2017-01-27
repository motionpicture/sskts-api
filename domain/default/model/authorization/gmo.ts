import ObjectId from "../objectId";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";

export default class GMOAuthorization extends Authorization {
    constructor(
        readonly _id: ObjectId,
        readonly price: number,
        readonly owner_from: Owner,
        readonly owner_to: Owner,
        readonly gmo_shop_id: string,
        readonly gmo_shop_pass: string,
        readonly gmo_order_id: string,
        readonly gmo_amount: number,
        readonly gmo_access_id: string,
        readonly gmo_access_pass: string,
        readonly gmo_job_cd: string,
        readonly gmo_pay_type: string,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.GMO, price, owner_from, owner_to);
    }
}