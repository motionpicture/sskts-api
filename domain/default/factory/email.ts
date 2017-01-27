import Email from "../model/email";
import ObjectId from "../model/objectId";

export function create(args: {
    _id: ObjectId,
    from?: string,
    to?: string,
    subject?: string,
    body?: string,
}) {
    return new Email(
        args._id,
        (args.from === undefined) ? "" : (args.from),
        (args.to === undefined) ? "" : (args.to),
        (args.subject === undefined) ? "" : (args.subject),
        (args.body === undefined) ? "" : (args.body),
    );
}