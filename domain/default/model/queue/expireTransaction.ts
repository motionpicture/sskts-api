import ObjectId from "../objectId";
import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";

export default class ExpireTransactionQueue extends Queue {
    constructor(
        readonly _id: ObjectId,
        readonly status: QueueStatus,
        readonly executed_at: Date,
        readonly count_try: number,
        readonly transaction_id: ObjectId,
    ) {
        // TODO validation

        super(_id, QueueGroup.EXPIRE_TRANSACTION, status, executed_at, count_try);
    }
}