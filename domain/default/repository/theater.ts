import monapt = require("monapt");
import Theater from "../model/theater";

/**
 * 劇場リポジトリ
 * 
 * @interface TheaterRepository
 */
interface TheaterRepository {
    /**
     * ID検索
     * 
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Theater>>;
    /**
     * 保管する
     * 
     * @param {Theater} theater 劇場
     */
    store(theater: Theater): Promise<void>;
}

export default TheaterRepository;