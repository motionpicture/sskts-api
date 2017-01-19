import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";
type TheaterAndScreenOperation<T> = (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => Promise<T>;
type TheaterAndFilmOperation<T> = (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => Promise<T>;
type FilmAndScreenAndPerformanceOperation<T> = (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => Promise<T>;

// マスターデータサービス
interface MasterService {
    importTheater(args: {
        theater_code: string
    }): (repository: TheaterRepository) => Promise<void>;
    importFilms(args: {
        theater_code: string
    }): TheaterAndFilmOperation<void>;
    importScreens(args: {
        theater_code: string
    }): TheaterAndScreenOperation<void>;
    importPerformances(args: {
        theater_code: string,
        day_start: string,
        day_end: string
    }): FilmAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
}

export default MasterService;