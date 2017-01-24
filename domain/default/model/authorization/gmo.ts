import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";

export default class GMOAuthorization extends Authorization {
    constructor(
        readonly _id: string,
        readonly order_id: string,
        readonly price: number,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.GMO, price);
    }
}