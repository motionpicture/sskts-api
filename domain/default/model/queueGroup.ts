type QueueGroup =
    "SETTLE_AUTHORIZATION"
    | "CANCEL_AUTHORIZATION"
    | "NOTIFICATION_PUSH"
    | "TRANSACTION_DISABLE_INQUIRY"
    ;

namespace QueueGroup {
    /** 資産移動 */
    export const SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    /** 資産承認解除 */
    export const CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    /** 通知送信 */
    export const NOTIFICATION_PUSH = "NOTIFICATION_PUSH";
    /** 取引照会無効化 */
    export const TRANSACTION_DISABLE_INQUIRY = "TRANSACTION_DISABLE_INQUIRY";
}

export default QueueGroup;