import ObjectId from "../objectId";
import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";
import Authorization from "../authorization";

export default class SettleAuthorizationQueue<T extends Authorization> extends Queue {
    constructor(
        readonly _id: ObjectId,
        readonly status: QueueStatus,
        readonly run_at: Date,
        readonly max_count_retry: number,
        readonly last_tried_at: Date | null,
        readonly count_tried: number,
        readonly results: Array<string>,
        readonly authorization: T,
    ) {
        super(
            _id,
            QueueGroup.SETTLE_AUTHORIZATION,
            status,
            run_at,
            max_count_retry,
            last_tried_at,
            count_tried,
            results
        );

        // TODO validation
    }
}