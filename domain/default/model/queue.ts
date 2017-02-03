import ObjectId from "./objectId";
import QueueGroup from "./queueGroup";
import QueueStatus from "./queueStatus";

/**
 * キュー(実行日時つきのタスク)
 * 
 * @export
 * @class Queue
 */
export default class Queue {
    /**
     * Creates an instance of Queue.
     * 
     * @param {ObjectId} _id
     * @param {QueueGroup} group キューグループ
     * @param {QueueStatus} status キューステータス
     * @param {Date} run_at 実行予定日時
     * @param {number} max_count_try 最大リトライ回数
     * @param {(Date | null)} last_tried_at 最終試行日時
     * @param {number} count_tried 試行回数
     * @param {Array<string>} results 実行結果リスト
     */
    constructor(
        readonly _id: ObjectId,
        readonly group: QueueGroup,
        readonly status: QueueStatus,
        readonly run_at: Date,
        readonly max_count_try: number,
        readonly last_tried_at: Date | null,
        readonly count_tried: number,
        readonly results: Array<string>
    ) {
        // TODO validation
    }
}