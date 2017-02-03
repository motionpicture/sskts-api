import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";
import MultilingualString from "../multilingualString";

/**
 * 興行所有者
 * 
 * @export
 * @class PromoterOwner
 * @extends {Owner}
 */
export default class PromoterOwner extends Owner {
    /**
     * Creates an instance of PromoterOwner.
     * 
     * @param {ObjectId} _id
     * @param {MultilingualString} name
     * 
     * @memberOf PromoterOwner
     */
    constructor(
        readonly _id: ObjectId,
        readonly name: MultilingualString,
    ) {
        super(_id, OwnerGroup.PROMOTER);

        // TODO validation
    }
}