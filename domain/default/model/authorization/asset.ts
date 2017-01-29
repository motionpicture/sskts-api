import ObjectId from "../objectId";
import Asset from "../asset";
import AuthorizationGroup from "../authorizationGroup";
import Authorization from "../authorization";
import Owner from "../owner";

/**
 * 資産承認
 * 
 * 誰が、誰に対して、何(資産)の所有を、承認するのか
 */
export default class AssetAuthorization extends Authorization {
    constructor(
        readonly _id: ObjectId,
        /** 資産 */
        readonly asset: Asset,
        /** 資産価値 */
        readonly price: number,
        /** 誰が */
        readonly owner_from: Owner,
        /** 誰に対して */
        readonly owner_to: Owner,
    ) {
        // TODO validation

        super(_id, AuthorizationGroup.ASSET, price, owner_from, owner_to);
    }
}