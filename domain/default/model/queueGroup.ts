type QueueGroup =
    "SETTLE_AUTHORIZATION"
    | "CANCEL_AUTHORIZATION"
    | "PUSH_NOTIFICATION"
    | "DISABLE_TRANSACTION_INQUIRY"
    ;

namespace QueueGroup {
    /** 資産移動 */
    export const SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    /** 資産承認解除 */
    export const CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    /** 通知送信 */
    export const PUSH_NOTIFICATION = "PUSH_NOTIFICATION";
    /** 取引照会無効化 */
    export const DISABLE_TRANSACTION_INQUIRY = "DISABLE_TRANSACTION_INQUIRY";
}

export default QueueGroup;