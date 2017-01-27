import ObjectId from "../objectId";
import Owner from "../owner";
import OwnerGroup from "../ownerGroup";

export default class MemberOwner extends Owner {
    constructor(
        readonly _id: ObjectId,
        readonly name_first: string,
        readonly name_last: string,
        readonly email: string,
        readonly tel: string,
    ) {
        // TODO validation

        super(_id, OwnerGroup.MEMBER);
    }
}