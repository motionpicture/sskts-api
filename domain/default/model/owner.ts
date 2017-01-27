import ObjectId from "./objectId";
import OwnerGroup from "./ownerGroup";

export default class Owner {
    constructor(
        readonly _id: ObjectId,
        readonly group: OwnerGroup,
    ) {
        // TODO validation
    }
}