import AuthorizationGroup from "./authorizationGroup";

export default class Authorization {
    constructor(
        readonly _id: string,
        readonly group: AuthorizationGroup,
        readonly price: number,
    ) {
        // TODO validation
    }
}