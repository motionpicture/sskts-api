import ObjectId from "./objectId";
import QueueGroup from "./queueGroup";
import QueueStatus from "./queueStatus";

/**
 * キュー(実行日時つきのタスク)
 */
export default class Queue {
    constructor(
        readonly _id: ObjectId,
        /** キューグループ */
        readonly group: QueueGroup,
        /** キューステータス */
        readonly status: QueueStatus,
        /** 実行予定日時 */
        readonly run_at: Date,
        /** 最大リトライ回数 */
        readonly max_count_try: number,
        /** 最終試行日時 */
        readonly last_tried_at: Date | null,
        /** 試行回数 */
        readonly count_tried: number,
        /** 実行結果リスト */
        readonly results: Array<string>
    ) {
        // TODO validation
    }
}