import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";

/**
 * 会員所有者
 * 
 * @export
 * @class MemberOwner
 * @extends {Owner}
 */
export default class MemberOwner extends Owner {
    /**
     * Creates an instance of MemberOwner.
     * 
     * @param {ObjectId} _id
     * @param {string} name_first
     * @param {string} name_last
     * @param {string} email
     * @param {string} tel
     * 
     * @memberOf MemberOwner
     */
    constructor(
        readonly _id: ObjectId,
        readonly name_first: string,
        readonly name_last: string,
        readonly email: string,
        readonly tel: string,
    ) {
        super(_id, OwnerGroup.MEMBER);

        // TODO validation
    }
}