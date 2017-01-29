import ObjectId from "./objectId";
import Owner from "./owner";
import Queue from "./queue";
import TransactionEvent from "./transactionEvent";
import TransactionEventGroup from "./transactionEventGroup";
import AuthorizeTransactionEvent from "./transactionEvent/authorize";
import UnauthorizeTransactionEvent from "./transactionEvent/unauthorize";
import EmailAddTransactionEvent from "./transactionEvent/emailAdd";
import EmailRemoveTransactionEvent from "./transactionEvent/emailRemove";
import TransactionStatus from "./transactionStatus";
import TransactionQueuesStatus from "./transactionQueuesStatus";

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
            return event.authorization_id.toString();
        });

        return authorizations.filter((authorization) => {
            return removedAuthorizationIds.indexOf(authorization._id.toString()) < 0;
        });
    }

    /**
     * イベントから承認リストを取得する
     */
    emails() {
        // メール追加イベント
        let emails = this.events.filter((event) => {
            return event.group === TransactionEventGroup.EMAIL_ADD;
        }).map((event: EmailAddTransactionEvent) => {
            return event.email;
        });

        // メール削除イベント
        let removedEmailIds = this.events.filter((event) => {
            return event.group === TransactionEventGroup.EMAIL_REMOVE;
        }).map((event: EmailRemoveTransactionEvent) => {
            return event.email_id.toString();
        });

        return emails.filter((email) => {
            return removedEmailIds.indexOf(email._id.toString()) < 0;
        });
    }
}