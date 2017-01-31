type TransactionStatus =
    "UNDERWAY"
    | "CLOSED"
    | "EXPIRED"
    ;

namespace TransactionStatus {
    /** 進行中 */
    export const UNDERWAY = "UNDERWAY";
    /** 成立済み */
    export const CLOSED = "CLOSED";
    /** 期限切れ */
    export const EXPIRED = "EXPIRED";
}

export default TransactionStatus;