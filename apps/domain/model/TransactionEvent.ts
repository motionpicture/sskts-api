import Authorization from "./Authorization";
import TransactionEventGroup from "./TransactionEventGroup";

export default class TransactionEvent {
    constructor(
        readonly _id: string,
        readonly group: TransactionEventGroup,
        readonly authorization: Authorization | null
    ) {
        // TODO validation
    }
}