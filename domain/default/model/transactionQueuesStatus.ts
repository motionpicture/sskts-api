type TransactionQueuesStatus =
    "UNEXPORTED"
    | "EXPORTING"
    | "EXPORTED"
    ;

namespace TransactionQueuesStatus {
    /** 未エクスポート */
    export const UNEXPORTED = "UNEXPORTED";
    /** エクスポート中 */
    export const EXPORTING = "EXPORTING";
    /** エクスポート済 */
    export const EXPORTED = "EXPORTED";
}

export default TransactionQueuesStatus;