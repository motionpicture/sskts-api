import ObjectId from "../objectId";
import Notification from "../notification";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

export default class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly notification: T
    ) {
        // TODO validation

        super(_id, TransactionEventGroup.NOTIFICATION_REMOVE, occurred_at);
    }
}