import AuthorizationGroup from "./authorizationGroup";
import Owner from "./owner";
import ObjectId from "./objectId";

export default class Authorization {
    constructor(
        readonly _id: ObjectId,
        /** 承認グループ */
        readonly group: AuthorizationGroup,
        /** 承認価格 */
        readonly price: number,
        /** 資産を差し出す所有者 */
        readonly owner_from: Owner,
        /** 資産を受け取る所有者 */
        readonly owner_to: Owner,
    ) {
        // TODO validation
    }
}