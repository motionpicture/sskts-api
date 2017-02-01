import ObjectId from "../objectId";
import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";
import Authorization from "../authorization";

export default class CancelAuthorizationQueue<T extends Authorization> extends Queue {
    constructor(
        readonly _id: ObjectId,
        readonly status: QueueStatus,
        readonly run_at: Date,
        readonly max_count_try: number,
        readonly last_tried_at: Date | null,
        readonly count_tried: number,
        readonly results: Array<string>,
        readonly authorization: T,
    ) {
        super(
            _id,
            QueueGroup.CANCEL_AUTHORIZATION,
            status,
            run_at,
            max_count_try,
            last_tried_at,
            count_tried,
            results,
        );

        // TODO validation
    }
}