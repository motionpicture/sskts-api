type TransactionEventGroup =
    "START"
    | "CLOSE"
    | "EXPIRE"
    | "AUTHORIZE"
    | "UNAUTHORIZE"
    | "NOTIFICATION_ADD"
    | "NOTIFICATION_REMOVE"
    ;

namespace TransactionEventGroup {
    /** 開始 */
    export const START = "START";
    /** 成立 */
    export const CLOSE = "CLOSE";
    /** 期限切れ */
    export const EXPIRE = "EXPIRE";
    /** オーソリアイテム追加 */
    export const AUTHORIZE = "AUTHORIZE";
    /** オーソリアイテム削除 */
    export const UNAUTHORIZE = "UNAUTHORIZE";
    /** 通知アイテム追加 */
    export const NOTIFICATION_ADD = "NOTIFICATION_ADD";
    /** 通知アイテム削除 */
    export const NOTIFICATION_REMOVE = "NOTIFICATION_REMOVE";
}

export default TransactionEventGroup;