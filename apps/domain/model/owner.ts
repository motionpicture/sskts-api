import OwnerGroup from "./ownerGroup";

export default class Owner {
    constructor(
        readonly _id: string,
        readonly group: OwnerGroup,
    ) {
        // TODO validation
    }
}