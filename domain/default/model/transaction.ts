import Owner from "./owner";
import Authorization from "./authorization";
import TransactionEvent from "./transactionEvent";
import TransactionStatus from "./transactionStatus";

export default class Transaction {
    constructor(
        readonly _id: string,
        readonly status: TransactionStatus,
        readonly events: Array<TransactionEvent>,
        readonly owners: Array<Owner>,
        readonly authorizations: Array<Authorization>,
        readonly email_queues: Array<any>, // TODO
        readonly expired_at: Date,
        readonly inquiry_id: string,
        readonly inquiry_pass: string,
        readonly queues_imported: boolean,
    ) {
        // TODO validation
    }
}