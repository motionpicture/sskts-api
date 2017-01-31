import ObjectId from "../objectId";
import Authorization from "../authorization";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

export default class Unauthorize extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly occurred_at: Date,
        readonly authorization: Authorization
    ) {
        // TODO validation

        super(_id, TransactionEventGroup.UNAUTHORIZE, occurred_at);
    }
}