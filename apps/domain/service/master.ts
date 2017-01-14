import TheaterRepository from "../repository/theater";
import FilmRepository from "../repository/film";
import ScreenRepository from "../repository/screen";
import PerformanceRepository from "../repository/performance";

// マスターデータサービス
interface MasterService {
    importTheater(code: string): (repository: TheaterRepository) => Promise<void>;
    importFilms(theaterCode: string): (repository: FilmRepository) => Promise<void>;
    importScreens(theaterCode: string): (repository: ScreenRepository) => Promise<void>;
    importPerformances(theaterCode: string, dayStart: string, dayEnd: string): (repository: PerformanceRepository) => Promise<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
}

export default MasterService;