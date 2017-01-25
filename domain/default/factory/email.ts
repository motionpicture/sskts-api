import Email from "../model/email";

export function create(args: {
    readonly _id: string,
    readonly from?: string,
    readonly to?: string,
    readonly subject?: string,
    readonly body?: string,
}) {
    return new Email(
        args._id,
        (args.from === undefined) ? "" : (args.from),
        (args.to === undefined) ? "" : (args.to),
        (args.subject === undefined) ? "" : (args.subject),
        (args.body === undefined) ? "" : (args.body),
    );
}