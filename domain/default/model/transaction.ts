import ObjectId from "./objectId";
import Owner from "./owner";
import Authorization from "./authorization";
import Email from "./email";
import Queue from "./queue";
import TransactionEvent from "./transactionEvent";
import TransactionStatus from "./transactionStatus";
import TransactionQueuesStatus from "./transactionQueuesStatus";

export default class Transaction {
    constructor(
        readonly _id: ObjectId,
        readonly status: TransactionStatus,
        readonly events: Array<TransactionEvent>,
        readonly owners: Array<Owner>,
        readonly authorizations: Array<Authorization>,
        readonly emails: Array<Email>,
        readonly queues: Array<Queue>,
        readonly expired_at: Date,
        readonly inquiry_id: string,
        readonly inquiry_pass: string,
        readonly queues_status: TransactionQueuesStatus,
    ) {
        // TODO validation
    }
}