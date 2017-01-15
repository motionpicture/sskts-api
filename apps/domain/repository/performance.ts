import Performance from "../model/Performance";

interface PerformanceRepository {
    find(id: string): Promise<Performance>;
    store(performance: Performance): Promise<void>;
}

export default PerformanceRepository;