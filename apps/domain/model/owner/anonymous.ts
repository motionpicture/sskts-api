import Owner from "../owner";
import OwnerGroup from "../ownerGroup";

export default class AnonymousOwner extends Owner {
    constructor(
        readonly _id: string,
        readonly name_first: string,
        readonly name_last: string,
        readonly email: string,
        readonly tel: string,
    ) {
        // TODO validation

        super(_id, OwnerGroup.ANONYMOUS);
    }
}