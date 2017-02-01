import ObjectId from "../model/objectId";

import Authorization from "../model/authorization";
import Notification from "../model/notification";

import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import CancelAuthorizationQueue from "../model/queue/cancelAuthorization";
import NotificationPushQueue from "../model/queue/notificationPush";
import TransactionDisableInquiryQueue from "../model/queue/transactionDisableInquiry";
import QueueGroup from "../model/queueGroup";
import QueueStatus from "../model/queueStatus";

export function create(args: {
    _id: ObjectId,
    group: QueueGroup,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: Array<string>
}) {
    return new Queue(
        args._id,
        args.group,
        args.status,
        args.run_at,
        args.max_count_try,
        args.last_tried_at,
        args.count_tried,
        args.results,
    );
}

export function createSettleAuthorization<T extends Authorization>(args: {
    _id: ObjectId,
    authorization: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: Array<string>
}) {
    return new SettleAuthorizationQueue<T>(
        args._id,
        args.status,
        args.run_at,
        args.max_count_try,
        args.last_tried_at,
        args.count_tried,
        args.results,
        args.authorization
    );
}

export function createCancelAuthorization<T extends Authorization>(args: {
    _id: ObjectId,
    authorization: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: Array<string>
}) {
    return new CancelAuthorizationQueue<T>(
        args._id,
        args.status,
        args.run_at,
        args.max_count_try,
        args.last_tried_at,
        args.count_tried,
        args.results,
        args.authorization
    );
}

export function createNotificationPush<T extends Notification>(args: {
    _id: ObjectId,
    notification: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: Array<string>
}) {
    return new NotificationPushQueue<T>(
        args._id,
        args.status,
        args.run_at,
        args.max_count_try,
        args.last_tried_at,
        args.count_tried,
        args.results,
        args.notification,
    );
}

export function createTransactionDisableInquiry(args: {
    _id: ObjectId,
    transaction_id: ObjectId,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: Array<string>
}) {
    return new TransactionDisableInquiryQueue(
        args._id,
        args.status,
        args.run_at,
        args.max_count_try,
        args.last_tried_at,
        args.count_tried,
        args.results,
        args.transaction_id,
    );
}