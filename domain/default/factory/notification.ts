import EmailNotification from "../model/notification/email";
import ObjectId from "../model/objectId";

export function createEmail(args: {
    _id: ObjectId,
    from: string,
    to: string,
    subject: string,
    content: string,
}) {
    return new EmailNotification(
        args._id,
        (args.from === undefined) ? "" : (args.from),
        (args.to === undefined) ? "" : (args.to),
        (args.subject === undefined) ? "" : (args.subject),
        (args.content === undefined) ? "" : (args.content),
    );
}