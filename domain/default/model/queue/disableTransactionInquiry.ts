import ObjectId from "../objectId";
import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";

/**
 * 取引照会無効化キュー
 * 
 * @export
 * @class DisableTransactionInquiryQueue
 * @extends {Queue}
 */
export default class DisableTransactionInquiryQueue extends Queue {
    /**
     * Creates an instance of DisableTransactionInquiryQueue.
     * 
     * @param {ObjectId} _id
     * @param {QueueStatus} status
     * @param {Date} run_at
     * @param {number} max_count_try
     * @param {(Date | null)} last_tried_at
     * @param {number} count_tried
     * @param {Array<string>} results
     * @param {ObjectId} transaction_id
     * 
     * @memberOf DisableTransactionInquiryQueue
     */
    constructor(
        readonly _id: ObjectId,
        readonly status: QueueStatus,
        readonly run_at: Date,
        readonly max_count_try: number,
        readonly last_tried_at: Date | null,
        readonly count_tried: number,
        readonly results: Array<string>,
        readonly transaction_id: ObjectId,
    ) {
        super(
            _id,
            QueueGroup.DISABLE_TRANSACTION_INQUIRY,
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