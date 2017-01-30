import ObjectId from "../objectId";
import Email from "../email";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

export default class EmailAddTransactionEvent extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly email: Email
    ) {
        // TODO validation

        super(_id, TransactionEventGroup.EMAIL_ADD, occurred_at);
    }
}