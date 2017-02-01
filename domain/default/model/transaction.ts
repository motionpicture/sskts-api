import ObjectId from "./objectId";
import Owner from "./owner";
import Queue from "./queue";
import TransactionEvent from "./transactionEvent";
import TransactionEventGroup from "./transactionEventGroup";
import AuthorizeTransactionEvent from "./transactionEvent/authorize";
import UnauthorizeTransactionEvent from "./transactionEvent/unauthorize";
import NotificationAddTransactionEvent from "./transactionEvent/notificationAdd";
import NotificationRemoveTransactionEvent from "./transactionEvent/notificationRemove";
import TransactionStatus from "./transactionStatus";
import TransactionQueuesStatus from "./transactionQueuesStatus";
import Notification from "./notification";

export default class Transaction {
    constructor(
        readonly _id: ObjectId,
        readonly status: TransactionStatus,
        readonly events: Array<TransactionEvent>,
        readonly owners: Array<Owner>,
        readonly queues: Array<Queue>,
        readonly expired_at: Date,
        readonly inquiry_id: string,
        readonly inquiry_pass: string,
        readonly queues_status: TransactionQueuesStatus,
    ) {
        // TODO validation
    }

    /**
     * イベントから承認リストを取得する
     */
    authorizations() {
        // 承認イベント
        let authorizations = this.events.filter((event) => {
            return event.group === TransactionEventGroup.AUTHORIZE;
        }).map((event: AuthorizeTransactionEvent) => {
            return event.authorization;
        });

        // 承認解除イベント
        let removedAuthorizationIds = this.events.filter((event) => {
            return event.group === TransactionEventGroup.UNAUTHORIZE;
        }).map((event: UnauthorizeTransactionEvent) => {
            return event.authorization._id.toString();
        });

        return authorizations.filter((authorization) => {
            return removedAuthorizationIds.indexOf(authorization._id.toString()) < 0;
        });
    }

    /**
     * イベントから通知リストを取得する
     */
    notifications() {
        let notifications = this.events.filter((event) => {
            return event.group === TransactionEventGroup.NOTIFICATION_ADD;
        }).map((event: NotificationAddTransactionEvent<Notification>) => {
            return event.notification;
        });

        // メール削除イベント
        let removedNotificationIds = this.events.filter((event) => {
            return event.group === TransactionEventGroup.NOTIFICATION_REMOVE;
        }).map((event: NotificationRemoveTransactionEvent<Notification>) => {
            return event.notification._id.toString();
        });

        return notifications.filter((notification) => {
            return removedNotificationIds.indexOf(notification._id.toString()) < 0;
        });
    }

    /**
     * 成立可能かどうか
     */
    canBeClosed() {
        let authorizations = this.authorizations();
        let pricesByOwner:{
            [ownerId: string]: number
        } = {}

        authorizations.forEach((authorization) => {
            if (!pricesByOwner[authorization.owner_from.toString()]) pricesByOwner[authorization.owner_from.toString()] = 0;
            if (!pricesByOwner[authorization.owner_to.toString()]) pricesByOwner[authorization.owner_to.toString()] = 0;

            pricesByOwner[authorization.owner_from.toString()] -= authorization.price;
            pricesByOwner[authorization.owner_to.toString()] += authorization.price;
        });

        return Object.keys(pricesByOwner).every((ownerId) => {
            return pricesByOwner[ownerId] === 0;
        });
    }
}