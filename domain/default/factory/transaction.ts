import ObjectId from "../model/objectId";
import Transaction from "../model/transaction";
import TransactionStatus from "../model/transactionStatus";
import TransactionEvent from "../model/transactionEvent";
import TransactionQueuesStatus from "../model/transactionQueuesStatus";
import Owner from "../model/owner";
import Queue from "../model/queue";

export function create(args: {
    _id?: ObjectId,
    status: TransactionStatus,
    events?: Array<TransactionEvent>,
    owners: Array<Owner>,
    queues?: Array<Queue>,
    expired_at: Date,
    inquiry_id?: string,
    inquiry_pass?: string,
    queues_status?: TransactionQueuesStatus,
}): Transaction {
    return new Transaction(
        (args._id === undefined) ? ObjectId() : (args._id),
        args.status,
        (args.events === undefined) ? [] : (args.events),
        args.owners,
        (args.queues === undefined) ? [] : (args.queues),
        args.expired_at,
        (args.inquiry_id === undefined) ? "" : (args.inquiry_id),
        (args.inquiry_pass === undefined) ? "" : (args.inquiry_pass),
        (args.queues_status === undefined) ? TransactionQueuesStatus.UNEXPORTED : (args.queues_status),
    );
}