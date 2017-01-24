import Asset from "../asset";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";

export default class AssetAuthorization extends Authorization {
    constructor(
        readonly _id: string,
        readonly asset: Asset,
        readonly price: number,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.ASSET, price);
    }
}