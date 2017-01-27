import ObjectId from "../model/objectId";
import Authorization from "../model/authorization";
import Email from "../model/email";
import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import CancelAuthorizationQueue from "../model/queue/cancelAuthorization";
import SendEmailQueue from "../model/queue/sendEmail";
import ExpireTransactionQueue from "../model/queue/expireTransaction";
import QueueGroup from "../model/queueGroup";
import QueueStatus from "../model/queueStatus";

export function create(args: {
    _id: ObjectId,
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
    _id: ObjectId,
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

export function createCancelAuthorization(args: {
    _id: ObjectId,
    authorization: Authorization,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new CancelAuthorizationQueue(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.authorization,
    );
}

export function createExpireTransaction(args: {
    _id: ObjectId,
    transaction_id: ObjectId,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new ExpireTransactionQueue(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.transaction_id,
    );
}

export function createSendEmail(args: {
    _id: ObjectId,
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