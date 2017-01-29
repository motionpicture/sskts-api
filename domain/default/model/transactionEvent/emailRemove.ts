import ObjectId from "../objectId";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

export default class EmailRemoveTransactionEvent extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly email_id: ObjectId
    ) {
        // TODO validation

        super(_id, TransactionEventGroup.EMAIL_REMOVE);
    }
}