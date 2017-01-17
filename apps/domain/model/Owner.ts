import OwnerGroup from "./OwnerGroup";

export default class Owner {
    constructor(
        readonly _id: string,
        readonly group: OwnerGroup,
    ) {
        // TODO validation
    }
}

export class Anonymous extends Owner {
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

export class Member extends Owner {
    constructor(
        readonly _id: string,
        readonly name_first: string,
        readonly name_last: string,
        readonly email: string,
        readonly tel: string,
    ) {
        // TODO validation

        super(_id, OwnerGroup.MEMBER);
    }
}