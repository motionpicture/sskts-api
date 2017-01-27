import ObjectId from "../objectId";
import Asset from "../asset";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";

export default class AssetAuthorization extends Authorization {
    constructor(
        readonly _id: ObjectId,
        readonly asset: Asset,
        readonly price: number,
        readonly owner_from: Owner,
        readonly owner_to: Owner,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.ASSET, price, owner_from, owner_to);
    }
}