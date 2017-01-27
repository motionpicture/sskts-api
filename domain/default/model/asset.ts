import AssetGroup from "./assetGroup";
import Authorization from "./authorization";

export default class Asset {
    constructor(
        readonly _id: string,
        readonly group: AssetGroup,
        readonly price: number,
        readonly authorizations: Array<Authorization>,
    ) {
        // TODO validation
    }
}