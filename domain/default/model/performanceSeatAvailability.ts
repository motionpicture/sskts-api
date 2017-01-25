interface Performance {
    /** パフォーマンスID */
    _id: string,
    /** 予約可能数 */
    count_all_seats: number,
    /** 予約可能残席数 */
    count_free_seats: number
}

/**
 * パフォーマンス座席利用状況
 * 日付ごとにパフォーマンスリストを持つ
 */
export default class PerformanceSeatAvailability {
    constructor(
        readonly date: string,
        readonly performances: Array<Performance>
    ) {
        // TODO validation
    }
}