import AuthorizationGroup from "./authorizationGroup";
import ObjectId from "./objectId";

/**
 * 承認
 * 
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 */
export default class Authorization {
    constructor(
        readonly _id: ObjectId,
        /** 承認グループ */
        readonly group: AuthorizationGroup,
        /** 承認価格 */
        readonly price: number,
        /** 資産を差し出す所有者 */
        readonly owner_from: ObjectId,
        /** 資産を受け取る所有者 */
        readonly owner_to: ObjectId,
    ) {
        // TODO validation
    }
}