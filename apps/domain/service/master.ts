import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";
type TheaterAndScreenOperation<T> = (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => Promise<T>;
type TheaterAndFilmOperation<T> = (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => Promise<T>;
type FilmAndScreenAndPerformanceOperation<T> = (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => Promise<T>;

// マスターデータサービス
interface MasterService {
    importTheater(code: string): (repository: TheaterRepository) => Promise<void>;
    importFilms(theaterCode: string): TheaterAndFilmOperation<void>;
    importScreens(theaterCode: string): TheaterAndScreenOperation<void>;
    importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
}

export default MasterService;