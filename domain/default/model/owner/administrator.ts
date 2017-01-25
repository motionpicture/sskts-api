import Owner from "../owner";
import OwnerGroup from "../ownerGroup";
import MultilingualString from "../multilingualString";

export default class AdministratorOwner extends Owner {
    constructor(
        readonly _id: string,
        readonly name: MultilingualString,
    ) {
        // TODO validation

        super(_id, OwnerGroup.ADMINISTRATOR);
    }
}