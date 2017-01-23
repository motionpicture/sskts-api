import Authorization from "../model/authorization";
import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import QueueGroup from "../model/queueGroup";
import QueueStatus from "../model/queueStatus";

export function create(args: {
    _id: string,
    group: QueueGroup,
    status: QueueStatus,
    executed_at: Date,
    count_try: number,
}) {
    return new Queue(
        args._id,
        args.group,
        args.status,
        args.executed_at,
        args.count_try,
    );
}

export function createSettleAuthorization(args: {
    authorization: Authorization,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new SettleAuthorizationQueue(
        `${QueueGroup.SETTLE_AUTHORIZATION}_${args.authorization._id}`,
        args.status,
        args.executed_at,
        args.count_try,
        args.authorization,
    );
}