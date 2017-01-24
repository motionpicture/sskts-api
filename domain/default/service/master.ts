import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";
import MultilingualString from "../model/multilingualString";
type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
type TheaterAndScreenOperation<T> = (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => Promise<T>;
type TheaterAndFilmOperation<T> = (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => Promise<T>;
type FilmAndScreenAndPerformanceOperation<T> = (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => Promise<T>;

interface SearchPerformancesConditions {
    day?: string,
    theater?: string
}
interface SearchPerformancesResult {
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

// マスターデータサービス
interface MasterService {
    /** 劇場インポート */
    importTheater(args: {
        theater_code: string
    }): (repository: TheaterRepository) => Promise<void>;
    /** 作品インポート */
    importFilms(args: {
        theater_code: string
    }): TheaterAndFilmOperation<void>;
    /** スクリーンインポート */
    importScreens(args: {
        theater_code: string
    }): TheaterAndScreenOperation<void>;
    /** パフォーマンスインポート */
    importPerformances(args: {
        theater_code: string,
        day_start: string,
        day_end: string
    }): FilmAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
    /** パフォーマンス検索 */
    searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<Array<SearchPerformancesResult>>;
}

export default MasterService;