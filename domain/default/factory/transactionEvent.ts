import ObjectId from "../model/objectId";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import EmailAddTransactionEvent from "../model/transactionEvent/emailAdd";
import EmailRemoveTransactionEvent from "../model/transactionEvent/emailRemove";
import TransactionEventGroup from "../model/transactionEventGroup";
import Authorization from "../model/authorization";
import Email from "../model/email";

export function create(args: {
    _id: ObjectId,
    group: TransactionEventGroup,
    occurred_at: Date,
}) {
    return new TransactionEvent(
        args._id,
        args.group,
        args.occurred_at,
    );
}

export function createAuthorize(args: {
    _id: ObjectId,
    occurred_at: Date,
    authorization: Authorization,
}) {
    return new AuthorizeTransactionEvent(
        args._id,
        args.occurred_at,
        args.authorization,
    );
}

export function createUnauthorize(args: {
    _id: ObjectId,
    occurred_at: Date,
    authorization: Authorization,
}) {
    return new UnauthorizeTransactionEvent(
        args._id,
        args.occurred_at,
        args.authorization,
    );
}

export function createEmailAdd(args: {
    _id: ObjectId,
    occurred_at: Date,
    email: Email,
}) {
    return new EmailAddTransactionEvent(
        args._id,
        args.occurred_at,
        args.email,
    );
}

export function createEmailRemove(args: {
    _id: ObjectId,
    occurred_at: Date,
    email_id: ObjectId,
}) {
    return new EmailRemoveTransactionEvent(
        args._id,
        args.occurred_at,
        args.email_id,
    );
}