import ObjectId from "../model/objectId";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import NotificationAddTransactionEvent from "../model/transactionEvent/notificationAdd";
import NotificationRemoveTransactionEvent from "../model/transactionEvent/notificationRemove";
import TransactionEventGroup from "../model/transactionEventGroup";
import Authorization from "../model/authorization";
import Notification from "../model/notification";

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

export function createNotificationAdd<T extends Notification>(args: {
    _id: ObjectId,
    occurred_at: Date,
    notification: T,
}) {
    return new NotificationAddTransactionEvent<T>(
        args._id,
        args.occurred_at,
        args.notification,
    );
}

export function createNotificationRemove<T extends Notification>(args: {
    _id: ObjectId,
    occurred_at: Date,
    notification: T,
}) {
    return new NotificationRemoveTransactionEvent<T>(
        args._id,
        args.occurred_at,
        args.notification,
    );
}