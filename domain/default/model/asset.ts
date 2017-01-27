import AssetGroup from "./assetGroup";
import Authorization from "./authorization";
import ObjectId from "./objectId";
import Owner from "./owner";

export default class Asset {
    constructor(
        readonly _id: ObjectId,
        readonly group: AssetGroup,
        readonly owner: Owner,
        readonly price: number,
        readonly authorizations: Array<Authorization>,
    ) {
        // TODO validation
    }
}