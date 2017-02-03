import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";

/**
 * 匿名所有者
 * 
 * @export
 * @class AnonymousOwner
 * @extends {Owner}
 */
export default class AnonymousOwner extends Owner {
    /**
     * Creates an instance of AnonymousOwner.
     * 
     * @param {ObjectId} _id
     * @param {string} name_first
     * @param {string} name_last
     * @param {string} email
     * @param {string} tel
     * 
     * @memberOf AnonymousOwner
     */
    constructor(
        readonly _id: ObjectId,
        readonly name_first: string,
        readonly name_last: string,
        readonly email: string,
        readonly tel: string,
    ) {
        super(_id, OwnerGroup.ANONYMOUS);

        // TODO validation
    }
}