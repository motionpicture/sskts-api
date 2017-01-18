type TransactionEventGroup =
    "START"
    | "CLOSE"
    | "EXPIRE"
    | "CANCEL"
    ;

namespace TransactionEventGroup {
    export const START = "START";
    export const CLOSE = "CLOSE";
    export const EXPIRE = "EXPIRE";
    export const CANCEL = "CANCEL";
}

export default TransactionEventGroup;