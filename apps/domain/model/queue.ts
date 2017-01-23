import QueueGroup from "./queueGroup";
import QueueStatus from "./queueStatus";

export default class Queue {
    constructor(
        readonly _id: string,
        readonly group: QueueGroup,
        readonly status: QueueStatus,
        readonly executed_at: Date,
        /** 実行試行回数 */
        readonly count_try: number,
    ) {
        // TODO validation
    }
}