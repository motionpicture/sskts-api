// import Transaction from "../model/transaction";
// import TransactionStatus from "../model/transactionStatus";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import TransactionEventGroup from "../model/transactionEventGroup";
import Authorization from "../model/authorization";

export function create(args: {
    _id?: string,
    group: TransactionEventGroup,
}) {
    return new TransactionEvent(
        (args._id === undefined) ? "" : (args._id),
        args.group,
    );
}

export function createAuthorize(args: {
    _id: string,
    authorization: Authorization,
}) {
    return new AuthorizeTransactionEvent(
        args._id,
        args.authorization,
    );
}

export function createUnauthorize(args: {
    _id: string,
    authorization_id: string,
}) {
    return new UnauthorizeTransactionEvent(
        args._id,
        args.authorization_id,
    );
}