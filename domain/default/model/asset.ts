import AssetGroup from "./assetGroup";
import Authorization from "./authorization";
import ObjectId from "./objectId";

export default class Asset {
    constructor(
        readonly _id: ObjectId,
        readonly group: AssetGroup,
        readonly price: number,
        readonly authorizations: Array<Authorization>,
    ) {
        // TODO validation
    }
}