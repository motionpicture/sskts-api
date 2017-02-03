import monapt = require("monapt");
import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";

import MultilingualString from "../model/multilingualString";
import Theater from "../model/theater";
import Film from "../model/film";
import Screen from "../model/screen";
import Performance from "../model/performance";

type TheaterOperation<T> = (repository: TheaterRepository) => Promise<T>;
type FilmOperation<T> = (repository: FilmRepository) => Promise<T>;
type ScreenOperation<T> = (repository: ScreenRepository) => Promise<T>;
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

/**
 * マスターサービス
 * マスターデータ(作品、劇場、スクリーン、パフォーマンスなど)をインポートしたり、検索したりするファンクション群
 * 
 * @interface MasterService
 */
interface MasterService {
    /** 劇場インポート */
    importTheater(args: {
        /** 劇場コード */
        theater_code: string
    }): TheaterOperation<void>;
    /** 作品インポート */
    importFilms(args: {
        /** 劇場コード */
        theater_code: string
    }): TheaterAndFilmOperation<void>;
    /** スクリーンインポート */
    importScreens(args: {
        /** 劇場コード */
        theater_code: string
    }): TheaterAndScreenOperation<void>;
    /** パフォーマンスインポート */
    importPerformances(args: {
        /** 劇場コード */
        theater_code: string,
        /** 上映日（開始日） */
        day_start: string,
        /** 上映日（終了日） */
        day_end: string
    }): FilmAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
    /** パフォーマンス検索 */
    searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<Array<SearchPerformancesResult>>;
    /** 劇場詳細 */
    findTheater(args: {
        /** 劇場コード */
        theater_id: string
    }): TheaterOperation<monapt.Option<Theater>>
    /** 作品詳細 */
    findFilm(args: {
        /** 作品ID */
        film_id: string
    }): FilmOperation<monapt.Option<Film>>
    /** スクリーン詳細 */
    findScreen(args: {
        /** スクリーンID */
        screen_id: string
    }): ScreenOperation<monapt.Option<Screen>>
    /** パフォーマンス詳細 */
    findPerformance(args: {
        /** パフォーマンスID */
        performance_id: string
    }): PerformanceOperation<monapt.Option<Performance>>
}

export default MasterService;