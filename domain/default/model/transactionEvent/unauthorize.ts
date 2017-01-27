import ObjectId from "../objectId";
import TransactionEvent from "../transactionEvent";
import TransactionEventGroup from "../transactionEventGroup";

export default class Unauthorize extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly authorization_id: string
    ) {
        // TODO validation

        super(_id, TransactionEventGroup.UNAUTHORIZE);
    }
}