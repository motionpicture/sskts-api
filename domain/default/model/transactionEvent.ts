import ObjectId from "./objectId";
import TransactionEventGroup from "./transactionEventGroup";

export default class TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly group: TransactionEventGroup,
    ) {
        // TODO validation
    }
}