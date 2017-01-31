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
    export const START = "START";
    export const CLOSE = "CLOSE";
    export const EXPIRE = "EXPIRE";
    export const AUTHORIZE = "AUTHORIZE";
    export const UNAUTHORIZE = "UNAUTHORIZE";
    export const NOTIFICATION_ADD = "NOTIFICATION_ADD";
    export const NOTIFICATION_REMOVE = "NOTIFICATION_REMOVE";
}

export default TransactionEventGroup;