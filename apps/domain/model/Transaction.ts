import Owner from "./Owner";
import TransactionEvent from "./TransactionEvent";
import TransactionStatus from "./TransactionStatus";

export default class Transaction {
    constructor(
        readonly _id: string,
        readonly password: string,
        readonly status: TransactionStatus,
        readonly events: Array<TransactionEvent>,
        readonly owners: Array<Owner>,
        readonly expired_at: Date,
        readonly access_id: string,
        readonly access_pass: string,
    ) {
        // TODO validation
    }
}