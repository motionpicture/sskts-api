import monapt = require("monapt");
import Performance from "../model/performance";

interface PerformanceRepository {
    findById(id: string): Promise<monapt.Option<Performance>>;
    find(conditions: Object): Promise<Array<Performance>>;
    store(performance: Performance): Promise<void>;
}

export default PerformanceRepository;