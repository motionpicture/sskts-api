import Authorization from "../model/authorization";
import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import QueueGroup from "../model/queueGroup";
import QueueStatus from "../model/queueStatus";

export function create(args: {
    _id: string,
    group: QueueGroup,
    status: QueueStatus
}) {
    return new Queue(
        args._id,
        args.group,
        args.status
    );
}

export function createSettleAuthorization(args: {
    authorization: Authorization,
    status: QueueStatus
}) {
    return new SettleAuthorizationQueue(
        `${QueueGroup.SETTLE_AUTHORIZATION}_${args.authorization._id}`,
        args.status,
        args.authorization,
    );
}