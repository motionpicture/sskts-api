import ObjectId from "../model/objectId";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import TransactionEventGroup from "../model/transactionEventGroup";
import Authorization from "../model/authorization";

export function create(args: {
    _id: ObjectId,
    group: TransactionEventGroup,
}) {
    return new TransactionEvent(
        args._id,
        args.group,
    );
}

export function createAuthorize(args: {
    _id: ObjectId,
    authorization: Authorization,
}) {
    return new AuthorizeTransactionEvent(
        args._id,
        args.authorization,
    );
}

export function createUnauthorize(args: {
    _id: ObjectId,
    authorization_id: ObjectId,
}) {
    return new UnauthorizeTransactionEvent(
        args._id,
        args.authorization_id,
    );
}