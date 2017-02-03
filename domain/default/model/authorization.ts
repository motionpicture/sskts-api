import AuthorizationGroup from "./authorizationGroup";
import ObjectId from "./objectId";

/**
 * 承認
 * 
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 * 
 * @export
 * @class Authorization
 */
export default class Authorization {
    /**
     * Creates an instance of Authorization.
     * 
     * @param {ObjectId} _id
     * @param {AuthorizationGroup} group 承認グループ
     * @param {number} price 承認価格
     * @param {ObjectId} owner_from 資産を差し出す所有者
     * @param {ObjectId} owner_to 資産を受け取る所有者
     */
    constructor(
        readonly _id: ObjectId,
        readonly group: AuthorizationGroup,
        readonly price: number,
        readonly owner_from: ObjectId,
        readonly owner_to: ObjectId,
    ) {
        // TODO validation
    }
}