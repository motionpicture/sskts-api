import ObjectId from "../objectId";
import Notification from "../notification";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

/**
 * 通知追加取引イベント
 * 
 * @export
 * @class NotificationAddTransactionEvent
 * @extends {TransactionEvent}
 * @template T
 */
export default class NotificationAddTransactionEvent<T extends Notification> extends TransactionEvent {
    /**
     * Creates an instance of NotificationAddTransactionEvent.
     * 
     * @param {ObjectId} _id
     * @param {Date} occurred_at
     * @param {T} notification
     * 
     * @memberOf NotificationAddTransactionEvent
     */
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly notification: T
    ) {
        super(_id, TransactionEventGroup.NOTIFICATION_ADD, occurred_at);

        // TODO validation
    }
}