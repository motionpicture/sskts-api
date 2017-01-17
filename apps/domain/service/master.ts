import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";
type FilmAndTheaterAndScreenAndPerformanceOperation<T> = (filmRepository: FilmRepository, theaterRepository: TheaterRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => Promise<T>;

// マスターデータサービス
interface MasterService {
    importTheater(code: string): (repository: TheaterRepository) => Promise<void>;
    importFilms(theaterCode: string): (repository: FilmRepository) => Promise<void>;
    importScreens(theaterCode: string): (repository: ScreenRepository) => Promise<void>;
    importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndTheaterAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
}

export default MasterService;