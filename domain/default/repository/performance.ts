import monapt = require("monapt");
import Performance from "../model/performance";

/**
 * パフォーマンスリポジトリ
 * 
 * @interface PerformanceRepository
 */
interface PerformanceRepository {
    /**
     * ID検索
     * 
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Performance>>;
    /**
     * 検索
     * 
     * @param {Object} conditions 検索条件
     */
    find(conditions: Object): Promise<Array<Performance>>;
    /**
     * 保管する
     * 
     * @param {Performance} performance パフォーマンス
     */
    store(performance: Performance): Promise<void>;
}

export default PerformanceRepository;