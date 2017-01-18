import Owner from "./owner";
import Authorization from "./authorization";
import TransactionEvent from "./transactionEvent";
import TransactionStatus from "./transactionStatus";

export default class Transaction {
    constructor(
        readonly _id: string,
        readonly password: string,
        readonly status: TransactionStatus,
        readonly events: Array<TransactionEvent>,
        readonly owners: Array<Owner>,
        readonly authorizations: Array<Authorization>,
        readonly expired_at: Date,
        readonly access_id: string,
        readonly access_pass: string,
    ) {
        // TODO validation
    }
}