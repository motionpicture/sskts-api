import ObjectId from "./objectId";
import Owner from "./owner";

/**
 * 所有権
 * 誰が、何を、所有するのか
 * 
 * @export
 * @class Ownership
 */
export default class Ownership {
    /**
     * Creates an instance of Ownership.
     * 
     * @param {ObjectId} _id
     * @param {Owner} owner 所有者
     * @param {boolean} authenticated 認証済みかどうか
     * 
     * @memberOf Ownership
     */
    constructor(
        readonly _id: ObjectId,
        readonly owner: Owner,
        readonly authenticated: boolean,
    ) {
        // TODO validation
    }
}