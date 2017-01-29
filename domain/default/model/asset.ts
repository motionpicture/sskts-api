import AssetGroup from "./assetGroup";
import Authorization from "./authorization";
import ObjectId from "./objectId";
import Ownership from "./ownership";

export default class Asset {
    constructor(
        /** ID */
        readonly _id: ObjectId,
        /** 資産グループ */
        readonly group: AssetGroup,
        /** 所有権 */
        readonly ownership: Ownership,
        /** 価格 */
        readonly price: number,
        /** 承認リスト */
        readonly authorizations: Array<Authorization>,
    ) {
        // TODO validation
    }
}