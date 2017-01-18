type TransactionStatus =
    "PROCESSING"
    | "CLOSED"
    | "EXPIRED"
    | "CANCELED"
    ;

namespace TransactionStatus {
    /** 進行中 */
    export const PROCESSING = "PROCESSING";
    /** 成立済み */
    export const CLOSED = "CLOSED";
    /** 期限切れ */
    export const EXPIRED = "EXPIRED";
    /** 取消済み */
    export const CANCELED = "CANCELED";
}

export default TransactionStatus;