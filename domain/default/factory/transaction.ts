import Transaction from "../model/transaction";
import TransactionStatus from "../model/transactionStatus";
import TransactionEvent from "../model/transactionEvent";
import Owner from "../model/owner";
import Authorization from "../model/authorization";
import Email from "../model/email";

export function create(args: {
    _id?: string,
    status: TransactionStatus,
    events?: Array<TransactionEvent>,
    owners: Array<Owner>,
    authorizations?: Array<Authorization>,
    emails?: Array<Email>,
    expired_at: Date,
    inquiry_id?: string,
    inquiry_pass?: string,
    queues_imported?: boolean,
}): Transaction {
    return new Transaction(
        (args._id === undefined) ? "" : (args._id),
        args.status,
        (args.events === undefined) ? [] : (args.events),
        args.owners,
        (args.authorizations === undefined) ? [] : (args.authorizations),
        (args.emails === undefined) ? [] : (args.emails),
        args.expired_at,
        (args.inquiry_id === undefined) ? "" : (args.inquiry_id),
        (args.inquiry_pass === undefined) ? "" : (args.inquiry_pass),
        (args.queues_imported === undefined) ? false : (args.queues_imported),
    );
}