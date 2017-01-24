import monapt = require("monapt");
import Screen from "../model/screen";
import Film from "../model/film";
import Performance from "../model/performance";
import COA = require("@motionpicture/coa-service");

interface PerformanceRepository {
    findById(id: string): Promise<monapt.Option<Performance>>;
    find(conditions: Object): Promise<Array<Performance>>;
    store(performance: Performance): Promise<void>;
    storeFromCOA(performanceByCOA: COA.findPerformancesByTheaterCodeInterface.Result): (screen: Screen, film: Film) => Promise<void>;
}

export default PerformanceRepository;