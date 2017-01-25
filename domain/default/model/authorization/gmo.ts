import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";

export default class GMOAuthorization extends Authorization {
    constructor(
        readonly _id: string,
        readonly order_id: string,
        readonly price: number,
        readonly owner_from: Owner,
        readonly owner_to: Owner,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.GMO, price, owner_from, owner_to);
    }
}