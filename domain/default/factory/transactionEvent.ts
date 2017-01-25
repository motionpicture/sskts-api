// import Transaction from "../model/transaction";
// import TransactionStatus from "../model/transactionStatus";
import TransactionEvent from "../model/transactionEvent";
import TransactionEventGroup from "../model/transactionEventGroup";

export function create(args: {
    _id?: string,
    group: TransactionEventGroup,
}) {
    return new TransactionEvent(
        (args._id === undefined) ? "" : (args._id),
        args.group,
    );
}