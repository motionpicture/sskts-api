import monapt = require("monapt");
import Performance from "../model/Performance";

interface PerformanceRepository {
    findById(id: string): Promise<monapt.Option<Performance>>;
    find(): Promise<Array<Performance>>;
    store(performance: Performance): Promise<void>;
}

export default PerformanceRepository;