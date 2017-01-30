import ObjectId from "./objectId";
import TransactionEventGroup from "./transactionEventGroup";

export default class TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        /** イベントグループ */
        readonly group: TransactionEventGroup,
        /** 発生日時 */
        readonly occurred_at: Date,
    ) {
        // TODO validation
    }
}