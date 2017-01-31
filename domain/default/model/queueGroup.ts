type QueueGroup =
    "SETTLE_AUTHORIZATION"
    | "CANCEL_AUTHORIZATION"
    | "NOTIFICATION_PUSH"
    ;

namespace QueueGroup {
    /** 資産移動 */
    export const SETTLE_AUTHORIZATION = "SETTLE_AUTHORIZATION";
    /** 資産承認解除 */
    export const CANCEL_AUTHORIZATION = "CANCEL_AUTHORIZATION";
    /** メール送信 */
    export const NOTIFICATION_PUSH = "NOTIFICATION_PUSH";
}

export default QueueGroup;