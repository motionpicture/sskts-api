type TransactionEventGroup =
    "START"
    | "CLOSE"
    | "EXPIRE"
    | "CANCEL"
    | "AUTHORIZE"
    | "UNAUTHORIZE"
    ;

namespace TransactionEventGroup {
    export const START = "START";
    export const CLOSE = "CLOSE";
    export const EXPIRE = "EXPIRE";
    export const CANCEL = "CANCEL";
    export const AUTHORIZE = "AUTHORIZE";
    export const UNAUTHORIZE = "UNAUTHORIZE";
}

export default TransactionEventGroup;