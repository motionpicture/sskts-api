import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";
import MultilingualString from "../multilingualString";

export default class AdministratorOwner extends Owner {
    constructor(
        readonly _id: ObjectId,
        readonly name: MultilingualString,
    ) {
        // TODO validation

        super(_id, OwnerGroup.ADMINISTRATOR);
    }
}