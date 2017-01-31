type TransactionEventGroup =
    "START"
    | "CLOSE"
    | "EXPIRE"
    | "AUTHORIZE"
    | "UNAUTHORIZE"
    | "EMAIL_ADD"
    | "EMAIL_REMOVE"
    ;

namespace TransactionEventGroup {
    export const START = "START";
    export const CLOSE = "CLOSE";
    export const EXPIRE = "EXPIRE";
    export const AUTHORIZE = "AUTHORIZE";
    export const UNAUTHORIZE = "UNAUTHORIZE";
    export const EMAIL_ADD = "EMAIL_ADD";
    export const EMAIL_REMOVE = "EMAIL_REMOVE";
}

export default TransactionEventGroup;