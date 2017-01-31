import ObjectId from "../objectId";
import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";
import Notification from "../notification";

export default class NotificationPushQueue<T extends Notification> extends Queue {
    constructor(
        readonly _id: ObjectId,
        readonly status: QueueStatus,
        readonly executed_at: Date,
        readonly count_try: number,
        readonly notification: T,
    ) {
        // TODO validation

        super(_id, QueueGroup.NOTIFICATION_PUSH, status, executed_at, count_try);
    }
}