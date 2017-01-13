import TransactionEvent from "./TransactionEvent";

interface Transaction {
    _id: string,
    password: string,
    // status: TransactionStatus,
    events: Array<TransactionEvent>
    owners: Array<string>,
    expired_at: Date,
    access_id?: string,
    access_pass?: string,
}

export default Transaction;