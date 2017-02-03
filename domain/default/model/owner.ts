import ObjectId from "./objectId";
import OwnerGroup from "./ownerGroup";

/**
 * 所有者
 * 
 * @export
 * @class Owner
 */
export default class Owner {
    /**
     * Creates an instance of Owner.
     * 
     * @param {ObjectId} _id
     * @param {OwnerGroup} group 所有者グループ
     */
    constructor(
        readonly _id: ObjectId,
        readonly group: OwnerGroup,
    ) {
        // TODO validation
    }
}