import MultilingualString from "../model/multilingualString";
import PerformanceRepository from "../repository/performance";
type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
interface SearchConditions {
    day?: string,
    theater?: string
}
interface SearchResult {
    _id: string,
    theater: {
        _id: string,
        name: MultilingualString
    },
    screen: {
        _id: string,
        name: MultilingualString
    },
    film: {
        _id: string,
        name: MultilingualString
    },
    day: string,
    time_start: string,
    time_end: string,
    canceled: boolean
}

// パフォーマンスサービス
interface PerformaneceService {
    /** 検索 */
    search(conditions: SearchConditions): PerformanceOperation<Array<SearchResult>>;
}

export default PerformaneceService;