import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";
import Authorization from "../authorization";

export default class CancelAuthorizationQueue extends Queue {
    constructor(
        readonly _id: string,
        readonly status: QueueStatus,
        readonly executed_at: Date,
        readonly count_try: number,
        readonly authorization: Authorization,
    ) {
        // TODO validation

        super(_id, QueueGroup.CANCEL_AUTHORIZATION, status, executed_at, count_try);
    }
}