type QueueStatus =
    "UNEXECUTED"
    | "RUNNING"
    | "EXECUTED"
    ;

namespace QueueStatus {
    /** 未実行 */
    export const UNEXECUTED = "UNEXECUTED";
    /** 実行中 */
    export const RUNNING = "RUNNING";
    /** 実行済 */
    export const EXECUTED = "EXECUTED";
}

export default QueueStatus;