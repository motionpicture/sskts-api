import ObjectId from "../model/objectId";

import Authorization from "../model/authorization";
import Notification from "../model/notification";

import Queue from "../model/queue";
import SettleAuthorizationQueue from "../model/queue/settleAuthorization";
import CancelAuthorizationQueue from "../model/queue/cancelAuthorization";
import NotificationPushQueue from "../model/queue/notificationPush";
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

export function createSettleAuthorization<T extends Authorization>(args: {
    _id: ObjectId,
    authorization: T,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new SettleAuthorizationQueue<T>(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.authorization,
    );
}

export function createCancelAuthorization<T extends Authorization>(args: {
    _id: ObjectId,
    authorization: T,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new CancelAuthorizationQueue<T>(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.authorization,
    );
}

export function createNotificationPush<T extends Notification>(args: {
    _id: ObjectId,
    notification: T,
    status: QueueStatus
    executed_at: Date,
    count_try: number,
}) {
    return new NotificationPushQueue<T>(
        args._id,
        args.status,
        args.executed_at,
        args.count_try,
        args.notification,
    );
}