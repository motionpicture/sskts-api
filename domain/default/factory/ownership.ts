import ObjectId from "../model/objectId";
import Owner from "../model/owner";
import Ownership from "../model/ownership";

export function create(args: {
    _id: ObjectId,
    owner: Owner,
    authenticated: boolean
}) {
    return new Ownership(
        args._id,
        args.owner,
        args.authenticated
    );
}