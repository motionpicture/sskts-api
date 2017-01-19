import QueueGroup from "./queueGroup";
import QueueStatus from "./queueStatus";

export default class Queue {
    constructor(
        readonly _id: string,
        readonly group: QueueGroup,
        readonly status: QueueStatus,
    ) {
        // TODO validation
    }
}