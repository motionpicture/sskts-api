import Authorization from "../model/authorization";
import Email from "../model/email";
import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import SendEmailQueue from "../model/queue/sendEmail";
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
    _id: string,
    authorization: Authorization,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new SettleAuthorizationQueue(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.authorization,
    );
}

export function createSendEmail(args: {
    _id: string,
    email: Email,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new SendEmailQueue(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.email,
    );
}