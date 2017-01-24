import TransactionEventGroup from "./transactionEventGroup";

export default class TransactionEvent {
    constructor(
        readonly _id: string,
        readonly group: TransactionEventGroup,
    ) {
        // TODO validation
    }
}