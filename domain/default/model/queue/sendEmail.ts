import Queue from "../queue";
import QueueGroup from "../queueGroup";
import QueueStatus from "../queueStatus";
import Email from "../email";

export default class SendEmailQueue extends Queue {
    constructor(
        readonly _id: string,
        readonly status: QueueStatus,
        readonly executed_at: Date,
        readonly count_try: number,
        readonly email: Email,
    ) {
        // TODO validation

        super(_id, QueueGroup.SEND_EMAIL, status, executed_at, count_try);
    }
}