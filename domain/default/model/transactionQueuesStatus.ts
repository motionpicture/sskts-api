type TransactionQueuesStatus =
    "UNEXPORTED"
    | "EXPORTING"
    | "EXPORTED"
    ;

namespace TransactionQueuesStatus {
    export const UNEXPORTED = "UNEXPORTED";
    export const EXPORTING = "EXPORTING";
    export const EXPORTED = "EXPORTED";
}

export default TransactionQueuesStatus;