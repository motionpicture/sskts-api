const enum PROCESS_STATUS {
    /** 処理待ち */
    PENDING = 0,
    /** 処理進行中 */
    UNDERWAY = 1,
    /** 処理済み */
    FINISHED = 2,
}

export default PROCESS_STATUS;