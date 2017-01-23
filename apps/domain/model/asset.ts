import AssetGroup from "./assetGroup";

export default class Asset {
    constructor(
        readonly _id: string,
        readonly group: AssetGroup,
        readonly price: number,
    ) {
        // TODO validation
    }
}