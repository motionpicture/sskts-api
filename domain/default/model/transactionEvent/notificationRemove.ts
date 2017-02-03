import ObjectId from "../objectId";
import Notification from "../notification";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

/**
 * 通知削除取引イベント
 * 
 * @export
 * @class NotificationRemoveTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 */
export default class NotificationRemoveTransactionEvent<T extends Notification> extends TransactionEvent {
    /**
     * Creates an instance of NotificationRemoveTransactionEvent.
     * 
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {T} notification
     * 
     * @memberOf NotificationRemoveTransactionEvent
     */
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly notification: T
    ) {
        super(_id, TransactionEventGroup.NOTIFICATION_REMOVE, occurred_at);

        // TODO validation
    }
}