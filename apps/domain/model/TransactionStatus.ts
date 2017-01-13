const enum STATUS {
    /** 進行中 */
    PROCESSING = 0,
    /** 成立済み */
    CLOSED = 1,
    /** 期限切れ */
    EXPIRED = 2,
    /** 取消済み */
    CANCELED = 3,
}

export default STATUS;